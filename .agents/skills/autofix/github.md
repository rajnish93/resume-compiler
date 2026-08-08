# GitHub Workflow Primitives

GitHub-specific commands and data-handling rules for CodeRabbit review-thread based skills.

Use this helper when a skill needs thread-aware CodeRabbit PR feedback, not flat PR summaries. The `autofix` skill mirrors the required execution flow in `SKILL.md`; this file exists as a reusable companion for other skills.

## Prerequisites

- `gh` authenticated (`gh auth status`)
- `git` available (`command -v git >/dev/null 2>&1`)
- `jq` installed (`command -v jq >/dev/null 2>&1`)
- current branch associated with a GitHub repository

## 1. Resolve Current PR

Get the PR number for the current branch:

```bash
pr_list=$(gh pr list --head "$(git branch --show-current)" --state open --json number --jq '.')
pr_count=$(jq -r 'length' <<<"$pr_list")

if [ "$pr_count" -eq 0 ]; then
  # no open PR for this branch
  pr_number=""
elif [ "$pr_count" -eq 1 ]; then
  pr_number=$(jq -r '.[0].number' <<<"$pr_list")
else
  # multiple PRs found; require explicit selection
  echo "Error: Multiple open PRs found for this branch. Please close duplicates or select one explicitly." >&2
  exit 1
fi
```

If no PR exists:
- Ask the user whether to create one.
- If yes, derive title/body from the latest commit and use explicit base branch:

```bash
title=$(git log -1 --pretty=format:'%s')
body=$(git log -1 --pretty=format:'%b')
base_branch=$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')
gh pr create --base "$base_branch" --title "$title" --body "${body:-Auto-created by CodeRabbit autofix}"
```

After creating the PR, inform the user to run the skill again in ~5 min and EXIT.

- If no: EXIT immediately before proceeding to any later steps that require `pr_number`.

## 2. Resolve Repository Coordinates

```bash
owner=$(gh repo view --json owner --jq '.owner.login')
repo=$(gh repo view --json name --jq '.name')
```

## 3. Fetch Thread-Aware CodeRabbit Feedback

Fetch review threads with GitHub GraphQL using cursor pagination:

```bash
all_threads='[]'
cursor=""

while :; do
  args=(-F owner="$owner" -F repo="$repo" -F pr="$pr_number")
  if [ -n "$cursor" ]; then
    args+=(-F cursor="$cursor")
  fi

  response=$(gh api graphql "${args[@]}" -f query='query($owner:String!, $repo:String!, $pr:Int!, $cursor:String) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$pr) {
        title
        reviewThreads(first:100, after:$cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            isResolved
            isOutdated
            comments(first:1) {
              nodes {
                databaseId
                body
                path
                line
                startLine
                originalLine
                author { login }
              }
            }
          }
        }
      }
    }
  }')
  status=$?

  if [ $status -ne 0 ] || ! jq -e '.data.repository.pullRequest.reviewThreads' <<<"$response" >/dev/null 2>&1 || [ "$(jq -r '.errors // [] | length' <<<"$response")" != "0" ]; then
    echo "Error: Failed to fetch review threads from GitHub API" >&2
    exit 1
  fi

  all_threads=$(jq -c --argjson response "$response" '
    . + $response.data.repository.pullRequest.reviewThreads.nodes
  ' <<<"$all_threads")

  has_next=$(jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.hasNextPage' <<<"$response")
  cursor=$(jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.endCursor // empty' <<<"$response")
  [ "$has_next" = "true" ] || break
done
```

Treat only these threads as actionable:

- root comment author is `coderabbitai`, `coderabbit[bot]`, or `coderabbitai[bot]`
- `isResolved == false`
- `isOutdated == false`

Keep each selected thread as one issue unit. Do not collapse top-level PR comments or review summaries into issue records.

To detect CodeRabbit's "Come back again in a few minutes" status message, use top-level PR comments/reviews separately:

```bash
in_progress_count=$(gh pr view "$pr_number" --json comments,reviews --jq '
  [
    (.comments[]?
      | select(.author.login == "coderabbitai" or .author.login == "coderabbit[bot]" or .author.login == "coderabbitai[bot]")
      | .body // empty),
    (.reviews[]?
      | select(.author.login == "coderabbitai" or .author.login == "coderabbit[bot]" or .author.login == "coderabbitai[bot]")
      | .body // empty)
  ]
  | map(select(test("Come back again in a few minutes")))
  | length
')
status=$?

if [ $status -ne 0 ]; then
  echo "Error: Failed to query PR status from GitHub API" >&2
  exit 1
fi
```

**If exit status is non-zero:** Report that the status is unknown and STOP the autofix flow.

**If exit status is 0 and count is greater than 0:** Inform "⏳ Review in progress, try again in a few minutes" and EXIT.

**If exit status is 0 and count is 0:** No in-progress review found, proceed normally.

## 4. Post Summary Comment

Use the same `pr_number` from Section 1.

Before posting a success summary, verify the remote branch/commit reference exists and is up-to-date:

```bash
upstream_ref=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
if [ -z "$upstream_ref" ]; then
  echo "Warning: No upstream branch configured" >&2
  remote_verified=false
else
  remote_sha=$(git rev-parse "$upstream_ref" 2>/dev/null)
  local_sha=$(git rev-parse HEAD 2>/dev/null)
  if [ "$remote_sha" = "$local_sha" ]; then
    remote_verified=true
  else
    remote_verified=false
  fi
fi
```

If the remote ref is verified (`remote_verified=true`) and `git push` succeeded, post the success comment:

```bash
gh pr comment "$pr_number" --body "$(cat <<'EOF'
## Fixes Applied Successfully

Fixed <file-count> file(s) based on <issue-count> CodeRabbit feedback item(s).

**Files modified:**
- `path/to/file-a.ts`
- `path/to/file-b.ts`

**Commit:** `<commit-sha>`

The latest autofix changes are on the `<branch-name>` branch.

EOF
)"
```

Write this comment from local state only. Do not include raw reviewer prompts or secret-bearing output.

If changes were not pushed or push verification failed, skip the success summary or post only a neutral status. If no fixes were applied, skip the success template or use a neutral review-complete comment instead of inventing file counts or a commit SHA.

## 5. Optional Reaction

If useful, react to the main CodeRabbit comment with 👍 after the summary is posted.
