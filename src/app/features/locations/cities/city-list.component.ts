import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { LocationService, City } from '../../../core/services/location.service';

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, MenuModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" [rounded]="true" (onClick)="router.navigate(['/locations'])" />
          <div>
            <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Cities</h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-0.5">Drag to reorder, toggle visibility — {{ cities().length }} cities</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <p-button label="Save Order" icon="pi pi-save" [loading]="saving()" [disabled]="!orderChanged()" (onClick)="saveOrder()" />
          <p-button icon="pi pi-refresh" severity="secondary" [outlined]="true" (onClick)="loadCities()" />
        </div>
      </div>

      <!-- Sortable Table -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <p-table
          [value]="cities()"
          (onRowReorder)="onRowReorder($event)"
          [rowHover]="true"
          styleClass="p-datatable-sm">

          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem"></th>
              <th style="width: 3rem">#</th>
              <th>City</th>
              <th style="width: 100px">Totems</th>
              <th style="width: 110px">Status</th>
              <th style="width: 4rem"></th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-city let-index="rowIndex">
            <tr [pReorderableRow]="index">
              <td>
                <span class="pi pi-bars cursor-grab text-surface-400" pReorderableRowHandle></span>
              </td>
              <td>
                <span class="text-surface-400 text-xs">{{ index + 1 }}</span>
              </td>
              <td>
                <span class="font-medium text-surface-900 dark:text-surface-100">{{ city.name }}</span>
              </td>
              <td>
                <span class="text-surface-600">{{ city.totemCount }}</span>
              </td>
              <td>
                <p-tag
                  [value]="city.isActive ? 'Active' : 'Inactive'"
                  [severity]="city.isActive ? 'success' : 'danger'" />
              </td>
              <td>
                <p-button
                  icon="pi pi-ellipsis-v"
                  [text]="true"
                  [rounded]="true"
                  severity="secondary"
                  (onClick)="currentRow = city; rowMenu.toggle($event)" />
                <p-menu #rowMenu [model]="getRowMenuItems(city)" [popup]="true" appendTo="body" />
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="summary">
            <div class="text-sm text-surface-500 dark:text-surface-400 px-4 py-3">
              {{ cities().length }} cities — drag rows to reorder, then click "Save Order"
            </div>
          </ng-template>
        </p-table>
      </div>

      <p-toast></p-toast>
    </div>
  `,
})
export class CityListComponent implements OnInit {
  readonly locationService = inject(LocationService);
  readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  cities = signal<City[]>([]);
  saving = signal(false);
  orderChanged = signal(false);
  currentRow: City | null = null;

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.locationService.getCities().subscribe({
      next: (cities) => {
        this.cities.set(cities);
        this.orderChanged.set(false);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to load cities' }),
    });
  }

  onRowReorder(event: any): void {
    // PrimeNG already reorders the array in-place
    this.orderChanged.set(true);
  }

  saveOrder(): void {
    this.saving.set(true);
    const updates = this.cities().map((city, index) => ({
      id: city.id,
      sortOrder: index + 1,
    }));

    // Save each city's new sortOrder
    let completed = 0;
    for (const update of updates) {
      this.locationService.updateCity(update.id, { sortOrder: update.sortOrder }).subscribe({
        next: () => {
          completed++;
          if (completed === updates.length) {
            this.saving.set(false);
            this.orderChanged.set(false);
            this.messageService.add({ severity: 'success', summary: 'Order saved', detail: `${updates.length} cities reordered` });
          }
        },
        error: () => {
          completed++;
          if (completed === updates.length) {
            this.saving.set(false);
            this.messageService.add({ severity: 'error', summary: 'Failed to save some orders' });
          }
        },
      });
    }
  }

  getRowMenuItems(row: City): MenuItem[] {
    return [
      {
        label: row.isActive ? 'Deactivate' : 'Activate',
        icon: row.isActive ? 'pi pi-eye-slash' : 'pi pi-eye',
        command: () => this.toggleActive(row),
      },
      {
        label: 'View Totems',
        icon: 'pi pi-map',
        command: () => this.router.navigate(['/locations/totems'], { queryParams: { cityId: row.id } }),
      },
    ];
  }

  toggleActive(city: City): void {
    this.locationService.updateCity(city.id, { isActive: !city.isActive }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: `${city.name} ${city.isActive ? 'deactivated' : 'activated'}`,
        });
        this.loadCities();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Failed to update' }),
    });
  }
}
