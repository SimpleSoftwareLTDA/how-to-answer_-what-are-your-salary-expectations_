import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { SalaryDataService, JobSalary } from './services/salary-data.service';
import { TranslationService } from './services/translation.service';
import { ResultsListComponent } from './components/results-list/results-list.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ResultsListComponent,
    SpinnerComponent,
    ErrorMessageComponent,
  ],
})
export class AppComponent {
  private salaryDataService = inject(SalaryDataService);
  public translations = inject(TranslationService);

  jobTitleCompany = signal('Software Engineer at Google');
  location = signal('San Francisco');
  useMockData = signal(true);

  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<JobSalary[]>([]);
  searched = signal(false);

  search(): void {
    if (!this.jobTitleCompany() && !this.location()) {
        this.error.set(this.translations.instant('errorEmptySearch'));
        return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.results.set([]);
    this.searched.set(true);

    const query = `${this.jobTitleCompany()} in ${this.location()}`.trim();

    this.salaryDataService.searchSalaries(query, this.useMockData())
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.results.set(data);
          if (data.length === 0) {
            this.error.set(this.translations.instant('errorNoResults'));
          }
        },
        error: (err) => {
          console.error(err);
          this.error.set(this.translations.instant('errorApi'));
        }
      });
  }

  toggleMockData(): void {
    this.useMockData.update(value => !value);
  }

  toggleLanguage(): void {
    this.translations.language.update(lang => lang === 'en' ? 'pt' : 'en');
  }
}
