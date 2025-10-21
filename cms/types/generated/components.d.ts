import type { Schema, Struct } from '@strapi/strapi';

export interface AdCreativeVariant extends Struct.ComponentSchema {
  collectionName: 'components_ad_creative_variants';
  info: {
    description: 'Variant for an ad creative';
    displayName: 'Creative Variant';
    icon: 'layers';
  };
  attributes: {
    asset: Schema.Attribute.Media & Schema.Attribute.Required;
    cta: Schema.Attribute.String;
    headline: Schema.Attribute.String;
    landing_url: Schema.Attribute.String;
    metadata: Schema.Attribute.JSON;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    weight: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
  };
}

export interface ArticleFactEntry extends Struct.ComponentSchema {
  collectionName: 'components_article_fact_entries';
  info: {
    description: 'Key fact item for fact boxes';
    displayName: 'Fact Entry';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    sources: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    value: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface CommonSourceLink extends Struct.ComponentSchema {
  collectionName: 'components_common_source_links';
  info: {
    description: 'External source reference';
    displayName: 'Source Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'ad.creative-variant': AdCreativeVariant;
      'article.fact-entry': ArticleFactEntry;
      'common.source-link': CommonSourceLink;
    }
  }
}
