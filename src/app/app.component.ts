import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleSheetsDbService } from 'ng-google-sheets-db';
import { map, Observable, tap } from 'rxjs';
import Swiper from 'swiper';
import { EffectCards } from 'swiper/modules';

const clueAttributesMapping = {
  id: "Id",
  category: "Category",
  expression: "Expression"
};

interface Clue {
  id: number;
  category: string;
  expression: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isSmallLogo = false;

  clues: Clue[] = [];
  unplayedClues = 0;

  cards: Clue[][] = [
    [...Array(8).keys()].map((key) => ({ id: key, category: '...', expression: '...' })),
  ]

  swiper!: Swiper;

  constructor(private googleSheetsDbService: GoogleSheetsDbService) { }

  ngOnInit(): void {
    this.googleSheetsDbService.getActive<Clue>(
      '1r1oDjrgLMdIsmiAu4H3sIM5RXgN3FgIaeO4F5uh714I', "Clues", clueAttributesMapping, "Active"
    ).pipe(
      map(clues => this.shuffleArray(clues).map(clue => ({ ...clue, isActive: false }))),
      tap(clues => this.clues = clues),
      tap(() => this.reshuffle()),
      tap(() => this.initSwiper())
    ).subscribe();
  }

  private initSwiper() {
    setTimeout(() => {
      this.swiper = new Swiper('.swiper', {
        modules: [EffectCards],
        effect: 'cards',
        grabCursor: true,
        allowSlideNext: false
      });

      this.swiper.on('slideChange', () => {
        const card = this.cards[this.swiper.activeIndex];
        this.swiper.allowSlideNext = card?.some(clue => clue.isActive);
      });
    }, 100);
  }

  toggleSelection(index: number) {
    const card = this.cards[this.swiper.activeIndex];
    const clue = card[index];
    if (!clue.isActive) {
      card.forEach(clue => clue.isActive = false);
    }
    clue.isActive = !clue.isActive;
    this.swiper.allowSlideNext = clue.isActive;
  }

  reshuffle() {
    const inactiveClues = this.clues.filter(clue => !clue.isActive);
    this.unplayedClues = inactiveClues.length;
    this.cards = this.chunkArray(inactiveClues, 8).filter(c => c.length === 8);
    this.resetSwiper();
  }

  refresh() {
    window.location.reload();
  }

  private resetSwiper() {
    if (this.swiper) {
      this.swiper.slideTo(0, 500, true);
      setTimeout(() => this.reInitSwiper(), 550);
    }
  }

  private reInitSwiper() {
    this.swiper.destroy();
    this.swiper.off('slideChange');
    this.initSwiper();
    console.log('used:', this.clues.filter(clue => clue.isActive).length);
  }

  private shuffleArray(array: any[]) {
    return array.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  private chunkArray<T>(array: T[], chunkSize = 8): T[][] {
    return array.reduce((result, _, index) => {
      if (index % chunkSize === 0) {
        result.push(array.slice(index, index + chunkSize));
      }
      return result;
    }, new Array<T[]>());
  }

  resizeLogo() {
    this.isSmallLogo = !this.isSmallLogo;
  }
}
