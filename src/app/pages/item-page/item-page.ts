import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemListComponent } from '../../components/item-list/item-list.component';

@Component({
  selector: 'app-item-page',
  standalone: true,
  imports: [CommonModule, ItemListComponent], 
  templateUrl: './item-page.html',
  styleUrl: './item-page.css'
})
export class ItemPage {

}