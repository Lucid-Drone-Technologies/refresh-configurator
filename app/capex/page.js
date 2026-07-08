import Configurator from '../components/Configurator';

export const metadata = {
  title: 'Lucid Sherpa · Buy Your Drone Outright',
  description: 'Own your Sherpa outright. Build your package and see your one-time price.',
  alternates: {
    canonical: 'https://pricing.lucidbots.com/capex',
  },
};

export default function CapexPage() {
  return <Configurator initialMode="capex" />;
}
