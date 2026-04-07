import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Dictionary } from '../../content';
import { I18n } from '../../core/i18n';
import { Locale } from '../../models';

type LegalKind = 'privacy' | 'disclaimer' | 'accessibility';

@Component({
  selector: 'app-legal',
  imports: [CommonModule, RouterLink],
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18n);
  private readonly subscriptions = new Subscription();

  locale: Locale = this.i18n.locale;
  dictionary: Dictionary = this.i18n.dictionary;
  kind: LegalKind = 'privacy';

  ngOnInit() {
    this.kind = (this.route.snapshot.data['kind'] || 'privacy') as LegalKind;
    this.subscriptions.add(
      this.i18n.locale$.subscribe(() => {
        this.locale = this.i18n.locale;
        this.dictionary = this.i18n.dictionary;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  routeTo(path = '') {
    return path || '/';
  }

  title() {
    return this.kind === 'privacy'
      ? this.dictionary.legal.privacyTitle
      : this.kind === 'disclaimer'
        ? this.dictionary.legal.disclaimerTitle
        : this.dictionary.legal.accessibilityTitle;
  }

  description() {
    if (this.kind === 'privacy') {
      return this.locale === 'mn'
        ? 'Rare Care нь хэрэглэгчийн мэдээллийг хамгийн бага хэмжээнд, тодорхой зорилгоор, зөвшөөрөлтэйгээр цуглуулна.'
        : 'Rare Care collects the minimum personal information needed for clear support flows, with consent and purpose limitation.';
    }

    if (this.kind === 'disclaimer') {
      return this.dictionary.common.educationalDisclaimer;
    }

    return this.locale === 'mn'
      ? 'Rare Care нь гар, гар утас, дэлгэц уншигч, тод контрастын хэрэглээг дэмжих суурь зарчмуудтайгаар бүтээгдсэн.'
      : 'Rare Care is built with semantic structure, keyboard access, visible focus states, and room to expand accessibility support over time.';
  }

  paragraphs() {
    const mn = this.locale === 'mn';

    if (this.kind === 'privacy') {
      return mn
        ? [
            'Хандив болон холбоо барих маягтаар ирсэн мэдээллийг зөвхөн тухайн хүсэлтийн дагуу дотоод бүртгэлд хадгална. Бид картын дэлгэрэнгүй мэдээллийг хадгалахгүй.',
            'Ирээдүйн олон нийтийн боломжууд хэрэгжихээс өмнө нэмэлт нууцлал, зохицуулалтын бодлого боловсруулна.',
          ]
        : [
            'Information submitted through donation and contact forms is stored only to manage those requests. We do not store raw card details.',
            'Additional privacy policies will be introduced before broader community features are launched.',
          ];
    }

    if (this.kind === 'disclaimer') {
      return mn
        ? [
            'Rare Care дээрх өвчний тайлбар, шинж тэмдэг, өдөр тутмын зөвлөгөө нь боловсролын зорилготой. Оношилгоо, эмчилгээ, эмийн зөвлөгөөг зөвхөн эмч мэргэжилтэн өгнө.',
            'Шинж тэмдэг хүчтэй өөрчлөгдөх, шинэ зовиур нэмэгдэх, эсвэл яаралтай тусламж хэрэгтэй санагдвал эмнэлгийн байгууллагад шууд хандана уу.',
          ]
        : [
            'Disease descriptions, symptom summaries, and daily support content on Rare Care are educational. Diagnosis, treatment, and medication guidance should come from a licensed clinician.',
            'If symptoms change suddenly, new urgent concerns appear, or emergency care may be needed, seek direct medical attention.',
          ];
    }

    return mn
      ? [
          'Энэ MVP хувилбар нь ойлгомжтой гарчиг, шошготой форм, гарын тусламжтай удирдлага, харагдах фокус төлөвийг багтаана.',
          'Өдрийн буланд аудио холбоос дэмжих суурийг бэлтгэсэн. Цаашид фонтын хэмжээ, контрастын тохиргоо, контентын уншлага нэмэх боломжтой.',
        ]
      : [
          'This MVP includes structured headings, labeled forms, keyboard-friendly navigation, and visible focus states.',
          'Daily Corner already supports optional audio links. Future iterations can add stronger contrast preferences, font controls, and richer audio support.',
        ];
  }
}
