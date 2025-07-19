import AppWrapper from '@/components/app-wrapper';
import eodData from '@/app/xceler_eodservice_publisheddata (1).json';

async function getEodDates() {
  try {
    const dates = eodData.map((trade: any) => trade.eod_run_date);
    const uniqueDates = [...new Set(dates)];
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return uniqueDates;
  } catch (error) {
    console.error("Failed to process EOD dates from JSON file:", error);
    return [];
  }
}

export default async function Page() {
  const eodDates = await getEodDates();
  return <AppWrapper eodDates={eodDates} />;
}
