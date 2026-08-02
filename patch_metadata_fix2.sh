#!/bin/bash
sed -i "/'Greedy Best-First':/i \  'Bidirectional BFS': {\n    complete: true,\n    optimal: true,\n    weighted: false,\n    bestFor: 'Large unweighted graphs where both endpoints are known',\n    advantage: 'Explores ~half the nodes compared to standard BFS',\n    limitation: 'Complex implementation; restricted to unweighted graphs',\n  }," frontend/src/data/algorithmMetadata.ts
