/**
 * Created by Andrew on 2017-05-21.
 */
import {ModuleWithProviders}   from '@angular/core';
import {Routes, RouterModule}  from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {SongComponent} from "./song/song.component";
import {DisplayComponent} from "./display/display.component";

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'song/create', component:SongComponent},
  {path: 'song/:id', component:SongComponent},
  {path: 'display/:id', component: DisplayComponent},
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path: '**', component: HomeComponent}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
