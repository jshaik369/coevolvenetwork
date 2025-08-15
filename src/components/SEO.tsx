import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
  imageUrl?: string;
  publishDate?: string;
  modifiedDate?: string;
  author?: string;
  category?: string;
  keywords?: string[];
  isBlogPost?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Co-Evolve Network - Global Platform for AI-Augmented Creators',
  description = 'Connect creators worldwide through accountability partnerships, pitch feedback, and verifiable outcomes in the AI creator economy. Barcelona and Bangalore hubs.',
  type = 'website',
  name = 'Co-Evolve Network',
  imageUrl = '/lovable-uploads/483a60b1-7682-4b57-847c-2628c6e6f3ed.png',
  publishDate,
  modifiedDate,
  author,
  category,
  keywords = ['AI creators', 'accountability partnerships', 'creator economy', 'Barcelona', 'Bangalore', 'AI collaboration', 'creator network', 'AI augmented creators', 'global platform'],
  isBlogPost = false
}) => {
  const location = useLocation();
  const currentUrl = `https://coevolvenetwork.com${location.pathname}`;
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://coevolvenetwork.com${imageUrl}`;

  // Use clean keywords for Co-Evolve Network only
  const cleanKeywords = keywords;

  // Create base Organization JSON-LD structured data
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Co-Evolve Network',
    url: 'https://coevolvenetwork.com',
    logo: 'https://coevolvenetwork.com/lovable-uploads/483a60b1-7682-4b57-847c-2628c6e6f3ed.png',
    description: 'Global platform for AI-augmented creators connecting through accountability partnerships',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@coevolvenetwork.com'
    },
    sameAs: [
      'https://www.linkedin.com/company/co-evolve-network',
      'https://twitter.com/coevolvenetwork'
    ]
  };

  // Enhanced BlogPosting JSON-LD structured data
  const blogPostStructuredData = isBlogPost && publishDate ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl
    },
    headline: title,
    image: {
      '@type': 'ImageObject',
      url: absoluteImageUrl,
      width: 1200,
      height: 630
    },
    datePublished: publishDate,
    dateModified: modifiedDate || publishDate,
    author: {
      '@type': 'Organization',
      name: author || 'Co-Evolve Network',
      url: 'https://coevolvenetwork.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Co-Evolve Network',
      logo: {
        '@type': 'ImageObject',
        url: 'https://coevolvenetwork.com/lovable-uploads/483a60b1-7682-4b57-847c-2628c6e6f3ed.png',
        width: 512,
        height: 512
      },
      url: 'https://coevolvenetwork.com'
    },
    description: description,
    keywords: cleanKeywords.join(', '),
    articleSection: category,
    inLanguage: 'en-US',
    isAccessibleForFree: true
  } : null;

  // Combine keywords with any additional category terms
  const keywordString = category 
    ? [...cleanKeywords, category.toLowerCase()].join(', ') 
    : cleanKeywords.join(', ');

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      <meta name="keywords" content={keywordString} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={isBlogPost ? 'article' : type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Co-Evolve Network" />
      <meta property="og:locale" content="en_US" />
      {isBlogPost && category && <meta property="article:section" content={category} />}
      {isBlogPost && publishDate && <meta property="article:published_time" content={publishDate} />}
      {isBlogPost && modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}
      {isBlogPost && <meta property="article:publisher" content="https://coevolvenetwork.com" />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:site" content="@coevolvenetwork" />
      <meta name="twitter:creator" content="@coevolvenetwork" />
      
      {/* LinkedIn specific */}
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      <meta name="author" content={author || name} />
      
      {/* Pinterest specific */}
      <meta name="pinterest:description" content={description} />
      <meta name="pinterest:image" content={absoluteImageUrl} />
      
      {/* Additional SEO meta tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      
      {/* JSON-LD structured data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationStructuredData)}
      </script>
      
      {blogPostStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(blogPostStructuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
