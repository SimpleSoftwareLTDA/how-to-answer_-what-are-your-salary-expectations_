import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

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
    ReactiveFormsModule,
    ResultsListComponent,
    SpinnerComponent,
    ErrorMessageComponent,
  ],
})

export class AppComponent {
  private salaryDataService = inject(SalaryDataService);
  private fb = inject(FormBuilder);
  public translations = inject(TranslationService);


  searchForm = this.fb.group({
    jobTitle: ['Software Engineer', Validators.required],
    company: ['Google', Validators.required]
  });


  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<JobSalary[]>([]);
  searched = signal(false);


  search(): void {
    if (this.searchForm.invalid) {
      this.error.set(this.translations.instant('errorEmptySearch'));
      return;
    }


    this.loading.set(true);
    this.error.set(null);
    this.results.set([]);
    this.searched.set(true);

    const { jobTitle, company } = this.searchForm.getRawValue();

    this.salaryDataService.searchSalaries(jobTitle || '', company || '')


      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data: JobSalary[]) => {
          this.results.set(data);
          if (data.length === 0) {
            this.error.set(this.translations.instant('errorNoResults'));
          }
        },
        error: (err: unknown) => {
          console.error(err);
          this.error.set(this.translations.instant('errorApi'));
        }
      });

  }



  toggleLanguage(): void {
    this.translations.language.update(lang => lang === 'en' ? 'pt' : 'en');
  }
}
