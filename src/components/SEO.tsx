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
  title = 'Co-Evolve Network - AI Creator Platform | Accountability Partnerships for Global Creators',
  description = 'Join the global AI creator platform connecting Barcelona and Bangalore. Build accountability partnerships, get pitch feedback, and achieve verifiable outcomes in the AI creator economy. Free to join.',
  type = 'website',
  name = 'Co-Evolve Network',
  imageUrl = '/lovable-uploads/483a60b1-7682-4b57-847c-2628c6e6f3ed.png',
  publishDate,
  modifiedDate,
  author,
  category,
  keywords = [
    'AI creator platform',
    'accountability partnerships',
    'creator economy 2025',
    'AI collaboration network',
    'Barcelona creators',
    'Bangalore creators',
    'global creator community',
    'AI-augmented creators',
    'pitch feedback platform',
    'creator accountability',
    'AI networking',
    'creator support network'
  ],
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
    logo: {
      '@type': 'ImageObject',
      url: 'https://coevolvenetwork.com/lovable-uploads/483a60b1-7682-4b57-847c-2628c6e6f3ed.png',
      width: 512,
      height: 512
    },
    description: 'Global AI creator platform connecting Barcelona and Bangalore through accountability partnerships and verifiable outcomes',
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Barcelona',
        addressCountry: 'ES'
      }
    },
    areaServed: ['ES', 'IN', 'US', 'GB', 'DE', 'FR', 'Worldwide'],
    slogan: 'Building the future of AI-augmented creation together',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@coevolvenetwork.com',
      availableLanguage: ['en', 'es', 'hi']
    },
    sameAs: [
      'https://www.linkedin.com/company/co-evolve-network',
      'https://twitter.com/coevolvenetwork'
    ],
    keywords: cleanKeywords.join(', ')
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
      
      {/* Enhanced crawler directives for better indexing */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Geographic targeting */}
      <meta name="geo.region" content="ES-CT" />
      <meta name="geo.placename" content="Barcelona" />
      <meta name="geo.position" content="41.3874;2.1686" />
      <meta name="ICBM" content="41.3874, 2.1686" />
      
      {/* Language and locale */}
      <meta httpEquiv="content-language" content="en-US" />
      <meta name="language" content="English" />
      
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
