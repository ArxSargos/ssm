# ssm
Simple State Management - simple implementation of satet management system - inpirex by redux and ngRx effects

ssm works invery simple way of providing paths to proper data slices, so each component or class(service) can access:
example of state:
```
app: {
  global: {
    appVersion: "1.0"
  }
  device: {
    os: "Windows",
    resolution: {width: 1280, height: 800},
    dpi: 72
  }
}
```
example of paths:
"app/global" - slice path to global data
"app/device" - slice path to device data
...

todo: create npm package

usage:
1. Import lib: ```import { SimpleStateManagement } from 'YOURPATH/simple-state-management';```
2. Create instance to use: ```private ssm = new SimpleStateManagement();``` returns singleton instance
3. Access data: ```this.ssm.read("data slice path");```

Methods to access data:
__read__: reads current content of given slice
__write__: swites data to given slice
__watch__: notifies you when you specified data slice updates

Example of use in stencil.js component:
```
import { Component, h, Prop } from '@stencil/core';
import { SimpleStateManagement } from '../../modules/ssm/simple-state-management';
​
@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  shadow: true
})
export class AppHome {
  @Prop() store_path: string = 'global/app';
​
  private ssm = new SimpleStateManagement();
  private unwatch: any;
​
  connectedCallback() {
    const data = this.ssm.read(this.store_path);
    console.log("app-home: read 'global/app'", data);
​
    console.log("app-home: write 'global/app'");
    this.ssm.write(this.store_path, {store_prop: true})
​
    // Watch
    console.log("app-home: watch 'global/app'");
    this.unwatch = this.ssm.watch(this.store_path, this.dataUpdated.bind(this));
  }
​
  disconnectedCallback() {
    this.unwatch();
  }
​
  dataUpdated() {
    console.log("app-home: change detected 'global/app'");
    const data = this.ssm.read(this.store_path);
    console.log("app-home: read 'global/app'", data);
  }
​
  render() {
    return (
      <div class='app-home'>
        <p>
          Welcome to the Stencil App Starter.
          You can use this starter to build entire apps all with
          web components using Stencil!
          Check out our docs on <a href='https://stenciljs.com'>stenciljs.com</a> to get started.
        </p>
​
        <stencil-route-link url='/profile/stencil'>
          <button>
            Profile page
          </button>
        </stencil-route-link>
      </div>
    );
  }
​

```
