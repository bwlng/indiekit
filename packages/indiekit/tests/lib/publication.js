import test from 'ava';
import nock from 'nock';
import {JekyllPreset} from '@indiekit/preset-jekyll';
import {getFixture} from '../helpers/fixture.js';
import {mongodbConfig} from '../../config/mongodb.js';
import {Cache} from '../../lib/cache.js';
import {
  getCategories,
  getConfig,
  getMediaEndpoint,
  getPreset,
  getStore
} from '../../lib/publication.js';

test.beforeEach(async t => {
  t.context = await {
    cache: new Cache(mongodbConfig),
    categories: {
      nock: nock('https://website.example').get('/categories.json'),
      url: 'https://website.example/categories.json'
    },
    config: {
      preset: new JekyllPreset().config,
      'slug-separator': '$'
    }
  };
});

test.afterEach.always(async () => {
  const database = await mongodbConfig;
  await database.dropDatabase();
});

test('Returns array of available categories', async t => {
  const result = await getCategories(t.context.cache, ['foo', 'bar']);
  t.deepEqual(result, ['foo', 'bar']);
});

test.serial('Fetches array from remote JSON file specified in `url` value', async t => {
  const scope = t.context.categories.nock.reply(200, ['foo', 'bar']);
  const result = await getCategories(t.context.cache, t.context.categories);
  t.deepEqual(result, ['foo', 'bar']);
  scope.done();
});

test.serial('Returns empty array if remote JSON file not found', async t => {
  const scope = t.context.categories.nock.replyWithError('Not found');
  const error = await t.throwsAsync(getCategories(t.context.cache, t.context.categories));
  t.is(error.message, `Unable to fetch ${t.context.categories.url}: Not found`);
  scope.done();
});

test('Merges values from custom and default configurations', t => {
  const customConfig = JSON.parse(getFixture('custom-config.json'));
  const result = getConfig(customConfig, t.context.config.preset);
  t.is(result['post-types'][0].template, 'etc/templates/article.njk');
  t.deepEqual(result['post-types'][1], {
    type: 'note',
    name: 'Journal entry',
    template: 'etc/templates/entry.njk',
    post: {
      path: '_entries/{{ published | date(\'X\') }}.md',
      url: 'entries/{{ published | date(\'X\') }}'
    }
  });
  t.deepEqual(result['post-types'][2], {
    type: 'photo',
    name: 'Picture',
    template: 'etc/templates/picture.njk',
    post: {
      path: '_pictures/{{ published | date(\'X\') }}.md',
      url: '_pictures/{{ published | date(\'X\') }}'
    },
    media: {
      path: 'src/media/pictures/{{ uploaded | date(\'X\') }}.{{ fileext }}',
      url: 'media/pictures/{{ uploaded | date(\'X\') }}.{{ fileext }}'
    }
  });
});

test('Gets preset for a publication', t => {
  const presets = [{
    id: 'foo',
    name: 'Foo'
  }, {
    id: 'bar',
    name: 'Bar'
  }];
  const result = getPreset(presets, 'foo');
  t.is(result.name, 'Foo');
});

test('Gets media endpoint from server derived values', t => {
  const publication = {
    config: {},
    mediaEndpoint: '/media'
  };
  const request = {
    protocol: 'https',
    headers: {
      host: 'server.example'
    }
  };
  const result = getMediaEndpoint(publication, request);
  t.is(result['media-endpoint'], 'https://server.example/media');
});

test('Gets media endpoint from publication configuration', t => {
  const publication = {
    config: {
      'media-endpoint': 'https://website.example/media'
    }
  };
  const request = {
    protocol: 'https',
    headers: {
      host: 'website.example'
    }
  };
  const result = getMediaEndpoint(publication, request);
  t.is(result['media-endpoint'], 'https://website.example/media');
});

test('Gets store function for a publication', t => {
  const stores = [{
    id: 'foo',
    name: 'Foo'
  }, {
    id: 'bar',
    name: 'Bar'
  }];
  const result = getStore(stores, 'foo');
  t.is(result.name, 'Foo');
});
