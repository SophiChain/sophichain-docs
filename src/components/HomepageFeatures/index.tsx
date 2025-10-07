import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Modular Architecture',
    emoji: '🏗️',
    description: (
      <>
        Built on .NET/ABP Framework with clear bounded contexts. Each module
        is independently deployable with pluggable providers for maximum flexibility.
      </>
    ),
  },
  {
    title: 'Multi-Tenant by Design',
    emoji: '🏢',
    description: (
      <>
        Complete data isolation with tenant-specific configuration. Support for
        both shared and dedicated database strategies with seamless scaling.
      </>
    ),
  },
  {
    title: 'Payment Flexibility',
    emoji: '💳',
    description: (
      <>
        Hybrid payment support: Shaparak for IRR, Stripe for international currencies,
        and Web3 for crypto payments. Mix and match payment methods per invoice.
      </>
    ),
  },
  {
    title: 'Event-Driven',
    emoji: '⚡',
    description: (
      <>
        Distributed workers and async processing with inbox/outbox patterns.
        Scale horizontally with RabbitMQ or Azure Service Bus integration.
      </>
    ),
  },
  {
    title: 'AI-Ready',
    emoji: '🤖',
    description: (
      <>
        Optional AIHub with LLM connectors, embeddings, and vector search.
        Tenant-isolated knowledge bases with quota management.
      </>
    ),
  },
  {
    title: 'Enterprise Grade',
    emoji: '🛡️',
    description: (
      <>
        OIDC/OpenIddict authentication, comprehensive authorization, audit logging,
        and performance optimization out of the box.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span className={styles.featureEmoji}>{emoji}</span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
