import { CONTENT_FILES } from '@content/index';
import type { VerbForms } from '@/vocab/types';
import { conjugate, regularPresent } from './conjugate';

const v = (
  thirdPerson: string,
  preterite: string,
  participle: string,
  auxiliary: 'haben' | 'sein' = 'haben',
): VerbForms => ({ thirdPerson, preterite, participle, auxiliary });

const present = (lemma: string, forms: VerbForms) => conjugate(lemma, forms).present;

describe('present tense', () => {
  it('regular verbs, e-insertion, s-stems, -eln/-ern', () => {
    expect(present('machen', v('macht', 'machte', 'gemacht'))).toEqual([
      'mache',
      'machst',
      'macht',
      'machen',
      'macht',
      'machen',
    ]);
    expect(present('arbeiten', v('arbeitet', 'arbeitete', 'gearbeitet'))).toEqual([
      'arbeite',
      'arbeitest',
      'arbeitet',
      'arbeiten',
      'arbeitet',
      'arbeiten',
    ]);
    expect(present('öffnen', v('öffnet', 'öffnete', 'geöffnet'))).toEqual([
      'öffne',
      'öffnest',
      'öffnet',
      'öffnen',
      'öffnet',
      'öffnen',
    ]);
    expect(present('zeichnen', v('zeichnet', 'zeichnete', 'gezeichnet'))[1]).toBe('zeichnest');
    expect(present('heißen', v('heißt', 'hieß', 'geheißen'))).toEqual([
      'heiße',
      'heißt',
      'heißt',
      'heißen',
      'heißt',
      'heißen',
    ]);
    expect(present('tanzen', v('tanzt', 'tanzte', 'getanzt'))[1]).toBe('tanzt');
    expect(present('sammeln', v('sammelt', 'sammelte', 'gesammelt'))).toEqual([
      'sammle',
      'sammelst',
      'sammelt',
      'sammeln',
      'sammelt',
      'sammeln',
    ]);
    expect(present('wandern', v('wandert', 'wanderte', 'gewandert', 'sein'))).toEqual([
      'wandere',
      'wanderst',
      'wandert',
      'wandern',
      'wandert',
      'wandern',
    ]);
    // Vowel + m/n or doubled consonant: no extra e.
    expect(present('wohnen', v('wohnt', 'wohnte', 'gewohnt'))[1]).toBe('wohnst');
    expect(present('lernen', v('lernt', 'lernte', 'gelernt'))[1]).toBe('lernst');
    expect(present('kommen', v('kommt', 'kam', 'gekommen', 'sein'))[1]).toBe('kommst');
  });

  it('vowel changes come from the 3rd person and stay out of ich/ihr', () => {
    expect(present('fahren', v('fährt', 'fuhr', 'gefahren', 'sein'))).toEqual([
      'fahre',
      'fährst',
      'fährt',
      'fahren',
      'fahrt',
      'fahren',
    ]);
    expect(present('lesen', v('liest', 'las', 'gelesen'))).toEqual([
      'lese',
      'liest',
      'liest',
      'lesen',
      'lest',
      'lesen',
    ]);
    expect(present('essen', v('isst', 'aß', 'gegessen'))).toEqual([
      'esse',
      'isst',
      'isst',
      'essen',
      'esst',
      'essen',
    ]);
    expect(present('geben', v('gibt', 'gab', 'gegeben'))[1]).toBe('gibst');
    expect(present('nehmen', v('nimmt', 'nahm', 'genommen'))[1]).toBe('nimmst');
    expect(present('halten', v('hält', 'hielt', 'gehalten'))).toEqual([
      'halte',
      'hältst',
      'hält',
      'halten',
      'haltet',
      'halten',
    ]);
    expect(present('treten', v('tritt', 'trat', 'getreten'))[1]).toBe('trittst');
    expect(present('laden', v('lädt', 'lud', 'geladen'))[1]).toBe('lädst');
  });

  it('modal-like verbs and the irregular core verbs', () => {
    expect(present('können', v('kann', 'konnte', 'gekonnt'))).toEqual([
      'kann',
      'kannst',
      'kann',
      'können',
      'könnt',
      'können',
    ]);
    expect(present('müssen', v('muss', 'musste', 'gemusst'))).toEqual([
      'muss',
      'musst',
      'muss',
      'müssen',
      'müsst',
      'müssen',
    ]);
    expect(present('wissen', v('weiß', 'wusste', 'gewusst'))).toEqual([
      'weiß',
      'weißt',
      'weiß',
      'wissen',
      'wisst',
      'wissen',
    ]);
    expect(present('mögen', v('mag', 'mochte', 'gemocht'))[1]).toBe('magst');
    expect(present('sein', v('ist', 'war', 'gewesen', 'sein'))).toEqual([
      'bin',
      'bist',
      'ist',
      'sind',
      'seid',
      'sind',
    ]);
    expect(present('haben', v('hat', 'hatte', 'gehabt'))[1]).toBe('hast');
    expect(present('werden', v('wird', 'wurde', 'geworden', 'sein'))[1]).toBe('wirst');
  });

  it('separable verbs move the prefix to the end', () => {
    expect(present('aufstehen', v('steht auf', 'stand auf', 'aufgestanden', 'sein'))).toEqual([
      'stehe auf',
      'stehst auf',
      'steht auf',
      'stehen auf',
      'steht auf',
      'stehen auf',
    ]);
    expect(present('vorschlagen', v('schlägt vor', 'schlug vor', 'vorgeschlagen'))[1]).toBe(
      'schlägst vor',
    );
  });

  it('flags forms that break the regular pattern', () => {
    expect(conjugate('fahren', v('fährt', 'fuhr', 'gefahren', 'sein')).irregularPresent).toEqual([
      1, 2,
    ]);
    expect(conjugate('machen', v('macht', 'machte', 'gemacht')).irregularPresent).toEqual([]);
    expect(regularPresent('sein')[0]).toBe('seie'); // why sein needs an override
  });
});

describe('other tenses', () => {
  it('Präteritum: weak, strong, -t/-d and s-stems', () => {
    expect(conjugate('machen', v('macht', 'machte', 'gemacht')).preterite).toEqual([
      'machte',
      'machtest',
      'machte',
      'machten',
      'machtet',
      'machten',
    ]);
    expect(conjugate('fahren', v('fährt', 'fuhr', 'gefahren', 'sein')).preterite).toEqual([
      'fuhr',
      'fuhrst',
      'fuhr',
      'fuhren',
      'fuhrt',
      'fuhren',
    ]);
    expect(conjugate('finden', v('findet', 'fand', 'gefunden')).preterite).toEqual([
      'fand',
      'fandest',
      'fand',
      'fanden',
      'fandet',
      'fanden',
    ]);
    expect(conjugate('essen', v('isst', 'aß', 'gegessen')).preterite).toEqual([
      'aß',
      'aßest',
      'aß',
      'aßen',
      'aßt',
      'aßen',
    ]);
    expect(conjugate('sein', v('ist', 'war', 'gewesen', 'sein')).preterite).toEqual([
      'war',
      'warst',
      'war',
      'waren',
      'wart',
      'waren',
    ]);
    expect(
      conjugate('aufstehen', v('steht auf', 'stand auf', 'aufgestanden', 'sein')).preterite[1],
    ).toBe('standest auf');
  });

  it('Perfekt uses the stored auxiliary; Futur I uses werden + infinitive', () => {
    const c = conjugate('aufstehen', v('steht auf', 'stand auf', 'aufgestanden', 'sein'));
    expect(c.perfect).toEqual([
      'bin aufgestanden',
      'bist aufgestanden',
      'ist aufgestanden',
      'sind aufgestanden',
      'seid aufgestanden',
      'sind aufgestanden',
    ]);
    expect(c.future[1]).toBe('wirst aufstehen');
    expect(conjugate('lesen', v('liest', 'las', 'gelesen')).perfect[0]).toBe('habe gelesen');
  });

  it('Imperativ: e→i kept, a→ä dropped, e-insertion, separable, modals have none', () => {
    const imp = (lemma: string, f: VerbForms) => conjugate(lemma, f).imperative;
    expect(imp('geben', v('gibt', 'gab', 'gegeben'))).toEqual(['gib', 'gebt', 'geben Sie']);
    expect(imp('lesen', v('liest', 'las', 'gelesen'))).toEqual(['lies', 'lest', 'lesen Sie']);
    expect(imp('sehen', v('sieht', 'sah', 'gesehen'))?.[0]).toBe('sieh');
    expect(imp('essen', v('isst', 'aß', 'gegessen'))?.[0]).toBe('iss');
    expect(imp('fahren', v('fährt', 'fuhr', 'gefahren', 'sein'))?.[0]).toBe('fahr(e)');
    expect(
      imp('berücksichtigen', v('berücksichtigt', 'berücksichtigte', 'berücksichtigt'))?.[0],
    ).toBe('berücksichtige');
    expect(imp('arbeiten', v('arbeitet', 'arbeitete', 'gearbeitet'))?.[0]).toBe('arbeite');
    expect(imp('öffnen', v('öffnet', 'öffnete', 'geöffnet'))?.[0]).toBe('öffne');
    expect(imp('sammeln', v('sammelt', 'sammelte', 'gesammelt'))?.[0]).toBe('sammle');
    expect(imp('halten', v('hält', 'hielt', 'gehalten'))?.[0]).toBe('halte');
    expect(imp('aufstehen', v('steht auf', 'stand auf', 'aufgestanden', 'sein'))).toEqual([
      'steh(e) auf',
      'steht auf',
      'stehen Sie auf',
    ]);
    expect(imp('sein', v('ist', 'war', 'gewesen', 'sein'))).toEqual(['sei', 'seid', 'seien Sie']);
    expect(imp('können', v('kann', 'konnte', 'gekonnt'))).toBeNull();
  });
});

describe('bundled verbs', () => {
  const verbs = CONTENT_FILES.flatMap((f) => f.words).filter((w) => w.verb);

  it('reproduce the stored 3rd person and have no empty forms', () => {
    expect(verbs.length).toBeGreaterThan(30);
    for (const w of verbs) {
      const c = conjugate(w.lemma, w.verb!);
      expect(c.present[2]).toBe(w.verb!.thirdPerson);
      for (const f of [...c.present, ...c.preterite, ...c.perfect, ...(c.imperative ?? [])]) {
        expect(f.trim()).toBe(f);
        expect(f).not.toMatch(/undefined|\s{2}/);
      }
    }
  });
});
