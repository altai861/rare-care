import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Dictionary } from '../../content';
import { I18n } from '../../core/i18n';
import { Locale } from '../../models';

@Component({
  selector: 'app-community',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './community.html',
  styleUrl: './community.css',
})
export class Community implements OnInit, OnDestroy {
  private readonly i18n = inject(I18n);
  private readonly subscriptions = new Subscription();
  private readonly storyStorageKey = 'rare-care-community-stories';

  locale: Locale = this.i18n.locale;
  dictionary: Dictionary = this.i18n.dictionary;
  storyDialogOpen = false;
  storyFeedback = '';
  userStories: CommunityStory[] = [];
  storyForm = this.createStoryForm();

  ngOnInit() {
    this.userStories = this.loadStoredStories();
    this.subscriptions.add(
      this.i18n.locale$.subscribe(() => {
        this.locale = this.i18n.locale;
        this.dictionary = this.i18n.dictionary;
        if (!this.storyDialogOpen) {
          this.storyForm = this.createStoryForm();
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  routeTo(path = '') {
    return path || '/';
  }

  get storyRoleOptions() {
    return [
      this.dictionary.community.storyRolePatient,
      this.dictionary.community.storyRoleCaregiver,
      this.dictionary.community.storyRoleFamily,
      this.dictionary.community.storyRoleSupporter,
    ];
  }

  get visibleStories(): CommunityStory[] {
    const dictionaryStories = this.dictionary.community.stories.map((story, index) => ({
      ...story,
      id: `default-${this.locale}-${index}`,
    }));

    return [...this.userStories, ...dictionaryStories];
  }

  openStoryDialog() {
    this.storyDialogOpen = true;
    this.storyFeedback = '';
    if (!this.storyForm.role) {
      this.storyForm.role = this.dictionary.community.storyRolePatient;
    }
  }

  closeStoryDialog() {
    this.storyDialogOpen = false;
  }

  isStoryValid() {
    const hasName = this.storyForm.anonymous || this.storyForm.name.trim().length > 1;
    return hasName && this.storyForm.role && this.storyForm.body.trim().length >= 40 && this.storyForm.consent;
  }

  submitStory() {
    if (!this.isStoryValid()) {
      this.storyFeedback = this.dictionary.community.storyRequired;
      return;
    }

    const context = this.storyForm.disease.trim();
    this.userStories.unshift({
      id: `shared-${Date.now()}`,
      name: this.storyForm.anonymous
        ? this.dictionary.community.storyAnonymousName
        : this.storyForm.name.trim(),
      role: context ? `${this.storyForm.role} · ${context}` : this.storyForm.role,
      body: this.storyForm.body.trim(),
    });
    this.saveStoredStories();
    this.storyDialogOpen = false;
    this.storyFeedback = this.dictionary.community.storySuccess;
    this.storyForm = this.createStoryForm();
  }

  private createStoryForm(): StoryForm {
    return {
      name: '',
      role: this.dictionary.community.storyRolePatient,
      disease: '',
      body: '',
      anonymous: false,
      consent: false,
    };
  }

  private loadStoredStories(): CommunityStory[] {
    try {
      const rawStories = localStorage.getItem(this.storyStorageKey);
      return rawStories ? JSON.parse(rawStories) : [];
    } catch {
      return [];
    }
  }

  private saveStoredStories() {
    try {
      localStorage.setItem(this.storyStorageKey, JSON.stringify(this.userStories));
    } catch {
      // Sharing should still work visually if local storage is unavailable.
    }
  }
}

type CommunityStory = {
  id: string;
  name: string;
  role: string;
  body: string;
};

type StoryForm = {
  name: string;
  role: string;
  disease: string;
  body: string;
  anonymous: boolean;
  consent: boolean;
};
