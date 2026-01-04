import Application from 'website-www/app';
import config from 'website-www/config/environment';
import setupSinon from 'ember-sinon-qunit';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import {
  forceModulesToBeLoaded,
  sendCoverage,
} from 'ember-cli-code-coverage/test-support';

setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupSinon();

QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});

start();
