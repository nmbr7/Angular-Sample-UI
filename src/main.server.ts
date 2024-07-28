import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { App } from './app/app/app.component';

const bootstrap = () => bootstrapApplication(App, config);

export default bootstrap;
