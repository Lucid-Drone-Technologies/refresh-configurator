import Configurator from '../components/Configurator';

export const metadata = {
  title: 'Lucid Refresh · Build Your Subscription',
  description: 'Build a working Sherpa subscription. $0 down, 24-month subscription.',
  alternates: {
    canonical: 'https://pricing.lucidbots.com/refresh',
  },
};

export default function RefreshPage() {
  return <Configurator initialMode="refresh" />;
}
