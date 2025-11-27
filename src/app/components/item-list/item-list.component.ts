import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, catchError, of } from 'rxjs';
import { Item } from '../../modele/item.model';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit {
  
  items$: Observable<Item[]> | undefined;
  
  errorMessage: string = '';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.items$ = this.itemService.getAll().pipe(
      catchError(err => {
        console.error('Erreur lors du chargement des items :', err);
        this.errorMessage = 'Erreur serveur : Impossible de charger les données.';
        return of([]); 
      })
    );
  }
}