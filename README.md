# consumeHolodex
Applications that consume the indexing(holdex) functionality can have two types of nodes:
  - Index Nodes
    - Below will apply to these applications:
      - holodex zome to be added in dna.json.
      - holodex application code to be downloaded on the node. 
  - Non-index Nodes
    - Below will apply to these applications:
      - holodex zome to be added in dna.json.

All tests running with current code. Run below command :

`hcdev --bridgeTo=.../holodex test`

work with bridgeTesting branch of holodex(https://github.com/Holochain/holodex/tree/bridgeTesting)

Consume holodex UI can be run using below command along with the same holodex branch as above.

`hcdev --bridgeTo=../holodex web`
