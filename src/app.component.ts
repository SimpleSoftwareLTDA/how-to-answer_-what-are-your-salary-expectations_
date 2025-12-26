import { ChangeDetectionStrategy, Component, signal, inject, AfterViewInit } from '@angular/core';
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

export class AppComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'SimpleSoftwareLTDA/what-are-your-salary-expectation');
    script.setAttribute('data-repo-id', 'R_kgDOQvR7dg');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOQvR7ds4C0RMH');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    // We append it to the body or the specifically created container if needed, 
    // but usually appending to the document is enough as it looks for .giscus class.
    document.body.appendChild(script);
  }
}
