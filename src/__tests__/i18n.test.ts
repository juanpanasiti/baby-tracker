import i18n from '../i18n';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

describe('i18n translations', () => {
  it('should have common.add defined in both dictionaries', () => {
    expect(en.common.add).toBe('Add');
    expect(es.common.add).toBe('Agregar');
  });

  it('should have timeline.filters defined in both dictionaries', () => {
    expect(en.timeline.filters.all).toBe('All');
    expect(en.timeline.filters.feedings).toBe('Feedings');
    expect(en.timeline.filters.diapers).toBe('Diapers');
    expect(en.timeline.filters.medications).toBe('Medications');
    expect(en.timeline.filters.growth).toBe('Growth');

    expect(es.timeline.filters.all).toBe('Todos');
    expect(es.timeline.filters.feedings).toBe('Tomas');
    expect(es.timeline.filters.diapers).toBe('Pañales');
    expect(es.timeline.filters.medications).toBe('Medicamentos');
    expect(es.timeline.filters.growth).toBe('Crecimiento');
  });

  it('should have growth and growth settings keys defined in both dictionaries', () => {
    expect(en.growth.title).toBe('Growth');
    expect(es.growth.title).toBe('Crecimiento');

    expect(en.settings.growthTracking).toBe('Growth Tracking');
    expect(es.settings.growthTracking).toBe('Seguimiento de Crecimiento');
  });

  it('should resolve translations via i18n instance', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('common.add')).toBe('Add');
    expect(i18n.t('timeline.filters.all')).toBe('All');
    expect(i18n.t('timeline.filters.growth')).toBe('Growth');
    expect(i18n.t('growth.title')).toBe('Growth');

    await i18n.changeLanguage('es');
    expect(i18n.t('common.add')).toBe('Agregar');
    expect(i18n.t('timeline.filters.all')).toBe('Todos');
    expect(i18n.t('timeline.filters.growth')).toBe('Crecimiento');
    expect(i18n.t('growth.title')).toBe('Crecimiento');
  });
});

