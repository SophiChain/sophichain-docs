import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SophiChain Documentation',
  tagline: 'The Modular Backbone for Modern Enterprise Applications',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  // If using custom domain: 'https://docs.sophichain.com'
  // If using GitHub Pages: 'https://sophichain.github.io'
  url: 'https://sophichain.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For custom domain: '/'
  // For GitHub Pages: '/sophichain-docs/'
  baseUrl: '/sophichain-docs/',

  // GitHub pages deployment config
  organizationName: 'sophichain',
  projectName: 'sophichain-docs',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/sophichain/sophichain-docs/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/sophichain-social-card.png',
    navbar: {
      title: 'SophiChain',
      logo: {
        alt: 'SophiChain Logo',
        src: 'img/logo-light-thumbnail.png',
        srcDark: 'img/logo-dark-thumbnail.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/sophichain',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started',
            },
            {
              label: 'Architecture',
              to: '/architecture',
            },
            {
              label: 'Modules',
              to: '/modules',
            },
          ],
        },
        {
          title: 'Modules',
          items: [
            {
              label: 'FinanceHub',
              to: '/modules/financehub',
            },
            {
              label: 'AIHub',
              to: '/modules/aihub',
            },
            {
              label: 'CommHub',
              to: '/modules/commhub',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/sophichain',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/sophichain/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/sophichain/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Contributing',
              to: '/contributing',
            },
            {
              label: 'Security',
              to: '/security',
            },
            {
              label: 'SophiLabs',
              href: 'https://sophilabs.ir',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SophiLabs. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'bash', 'json', 'yaml', 'docker'],
    },
    // Uncomment and configure when ready for Algolia search:
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'sophichain',
    // },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
