#!/usr/bin/env python3
"""Build a small, searchable IATA-code airport index from public-domain OurAirports data.

Source: https://ourairports.com/data/ (public domain, community-maintained).
Only data used to find airports; neither ticket availability nor current IATA certification.
"""
import csv
import io
import json
import pathlib
import re
import urllib.request

BASE = 'https://davidmegginson.github.io/ourairports-data/'
OUTPUT = pathlib.Path(__file__).resolve().parents[1] / 'src/data/airport-directory.json'


def csv_rows(filename):
    req = urllib.request.Request(BASE + filename, headers={'User-Agent': 'SapphireQuest-AirportDirectory/1.0 (+https://sapphirequestravel.com)'})
    with urllib.request.urlopen(req, timeout=55) as response:
        if response.status != 200:
            raise RuntimeError('Airport directory download returned ' + str(response.status))
        data = response.read(18_000_000)
    return list(csv.DictReader(io.StringIO(data.decode('utf-8-sig'))))


def main():
    countries = {row['code']: row['name'] for row in csv_rows('countries.csv')}
    best = {}
    for row in csv_rows('airports.csv'):
        code = row.get('iata_code', '').strip().upper()
        if not re.fullmatch(r'[A-Z]{3}', code):
            continue
        facility = row.get('type', '')
        if facility not in {'large_airport', 'medium_airport', 'small_airport'}:
            continue
        name = (row.get('name') or '').strip()[:100]
        city = (row.get('municipality') or name or code).strip()[:90]
        country = (countries.get(row.get('iso_country'), row.get('iso_country') or '')).strip()[:80]
        scheduled = row.get('scheduled_service') == 'yes'
        score = (6 if scheduled else 0) + {'large_airport': 3, 'medium_airport': 2, 'small_airport': 0}[facility]
        result = {'code': code, 'city': city, 'country': country, 'name': name, 'scheduled': scheduled, 'rank': score}
        if code not in best or score > best[code]['rank']:
            best[code] = result
    data = sorted(best.values(), key=lambda x: (-x['rank'], x['country'], x['city'], x['code']))
    if len(data) < 2500 or not all(k in best for k in ['ABV', 'LOS', 'LHR', 'JFK', 'DXB', 'SIN', 'DOH']):
        raise RuntimeError('Airport directory sanity check failed. Refusing to overwrite local index.')
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'Wrote {len(data)} unique IATA-coded airports to {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)')


if __name__ == '__main__':
    main()
