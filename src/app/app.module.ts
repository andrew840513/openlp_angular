import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {routing} from './route';
import { SongComponent } from './song/song.component';
import { DisplayComponent } from './display/display.component';
import { FullscreenComponent } from './fullscreen/fullscreen.component';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SongComponent,
        DisplayComponent,
        FullscreenComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        routing
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
