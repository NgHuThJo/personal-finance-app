#!/usr/bin/env bash

# -e: exit on error
# -u: error on unset variable
# -o pipefail: pipeline fails if ANY command fails
# First version for more verbose logs
set -xeuo pipefail
# set -euo pipefail


runDocker() {
    docker run --rm --env-file C:/Dev/FrontEndMentorChallenges_2.0/Guru/personal-finance-app/backend/Src/.env -p 8080:8080 "$1"
}

getDockerContainerId() {
    awk -v pattern="$1" '$NF == pattern { print $1 }'
}

runInteractiveDocker() {
    docker exec -it "$1" sh
}

runGhAct() {
    gh act --secret-file .secrets -s GITHUB_TOKEN="$(gh auth token)"
}

processDotnetSecrets() {
    local projectDir="$1"

    dotnet user-secrets list --project "$1" | sed 's/:/__/g; s/[[:space:]]*=[[:space:]]*/=/' > "$projectDir/.env"

    return 0
}

forLoop() {
    for i in "$@"; do
        printf '%s\n' "$i"
    done

    return 0
}

whileLoop() {
    # True by itself is a no-op
    # Assigning variables with and without quotes has same behavior, rare quote exception
    local i=$1
    while [ "$i" -lt 3 ]; do
        printf '%s\n' "$((i))"
        i=$((i + 1))
    done
}

readFile() {
    while IFS= read -r line; do
        printf '%s\n' "$line"
    done < "$1"

    return 0
}

delegate() {
# Use shift to exclude the first positional argument which is script name
    local cmd=$1
    shift

    case "$cmd" in 
        runDocker) runDocker "$@" ;;
        runInteractiveDocker) runInteractiveDocker "$@" ;;
        getDockerContainerId) getDockerContainerId "$@" ;;
        readFile) readFile "$@" ;;
        runGhAct) runGhAct "$@" ;;
        forLoop) forLoop "$@" ;;
        whileLoop) whileLoop "$@" ;;
        processDotnetSecrets) processDotnetSecrets "$@" ;;
        *) printf '%s\n' "Unknown command: $1" >&2; exit 1;;
    esac
}

delegate "$@"
