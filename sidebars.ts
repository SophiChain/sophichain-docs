import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Single unified sidebar with all documentation
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'getting-started/index',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/index',
        'architecture/domain-driven-design',
        'architecture/clean-architecture',
        'architecture/event-driven-architecture',
        'architecture/multi-tenancy',
        'architecture/pluggable-providers',
        'architecture/extensibility',
        'architecture/api-design',
        'architecture/security',
        'architecture/performance',
        'architecture/testing',
      ],
    },
    {
      type: 'category',
      label: 'Modules',
      collapsed: false,
      items: [
        'modules/index',
        {
          type: 'category',
          label: 'FinanceHub',
          items: [
            'modules/financehub/index',
            'modules/financehub/capabilities',
            'modules/financehub/architecture',
            'modules/financehub/flowcharts',
          ],
        },
        'modules/aihub/index',
        'modules/commhub/index',
        {
          type: 'category',
          label: 'Business Modules',
          collapsed: true,
          items: [
            'modules/ecommerce/index',
            'modules/helpdesk/index',
            'modules/crm/index',
            'modules/queue-manager/index',
          ],
        },
      ],
    },
    {
      type: 'doc',
      id: 'security/index',
      label: 'Security',
    },
    {
      type: 'doc',
      id: 'deployment/index',
      label: 'Deployment',
    },
    {
      type: 'doc',
      id: 'contributing',
      label: 'Contributing',
    },
    {
      type: 'doc',
      id: 'directory-structure',
      label: 'Directory Structure',
    },
  ],
};

export default sidebars;