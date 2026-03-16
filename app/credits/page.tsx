import creditsData from '@/_data/credits.json';
import CreditsClient from './credits-client';

export default function CreditsPage(){
  return <CreditsClient credits={creditsData}/>;
}