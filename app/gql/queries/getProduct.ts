import { gql } from 'nuxt-graphql-request/utils';

export const getProductQuery = gql`
  query getProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ... on VariableProduct {
        databaseId
        sku
        slug
        name
        regularPrice
        salePrice
        description
        image {
          sourceUrl(size: LARGE)
        }
        galleryImages {
          nodes {
            sourceUrl(size: LARGE)
          }
        }
        attributes {
          nodes {
            name
            options
          }
        }
        variations(where: { orderby: { field: NAME, order: DESC } }) {
          nodes {
            databaseId
            stockStatus
            stockQuantity
            price
            regularPrice
            salePrice
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
        related(first: 50) {
          nodes {
            ... on VariableProduct {
              sku
              slug
              name
              regularPrice
              salePrice
              attributes {
                nodes {
                  name
                  options
                }
              }
              image {
                sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
              }
              galleryImages {
                nodes {
                  sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
                }
              }
            }
          }
        }
      }
    }
  }
`;
