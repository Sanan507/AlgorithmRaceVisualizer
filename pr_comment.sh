#!/bin/bash
curl -s -X POST -H "Accept: application/vnd.github.v3+json" \
  -d "{\"body\": \"Hi there! I've reviewed your PR. The added ARIA labels and \`focus-visible\` styles correctly follow accessibility best practices, improving support for screen readers and keyboard navigation. I pulled the branch, built the frontend, ran the linters/tests, and everything passed perfectly. \n\nNo issues found, this looks good to go! 🚀\", \"event\": \"COMMENT\"}" \
  "https://api.github.com/repos/Sanan507/AlgorithmRaceVisualizer/pulls/38/reviews"
