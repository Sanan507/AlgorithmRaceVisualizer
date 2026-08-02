#!/bin/bash
awk '
BEGIN { count = 0 }
/Bidirectional BFS/ { count++ }
count == 2 && /Bidirectional BFS/ { skip = 8; next }
skip > 0 { skip--; next }
{ print }
' frontend/src/data/algorithmMetadata.ts > tmp && mv tmp frontend/src/data/algorithmMetadata.ts
