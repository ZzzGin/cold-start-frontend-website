/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const listColdStartSummariesAfterTimestamp = /* GraphQL */ `
  query ListColdStartSummariesAfterTimestamp(
    $PK: String!
    $SK_from: Float!
    $SK_to: Float!
  ) {
    listColdStartSummariesAfterTimestamp(
      PK: $PK
      SK_from: $SK_from
      SK_to: $SK_to
    ) {
      items {
        Configs
        PK
        SK
        Summary
      }
    }
  }
`;
