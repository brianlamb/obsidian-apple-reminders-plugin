import { LitElement, html, css, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AppleReminderSpec, ListModel, ReminderModel } from 'src/models/shared.models';
import { RemindersDataService } from 'src/data/reminders-data.service';
import { LoadingBarComponent } from './loading-bar.element';
import { ReminderElement } from './reminder.element';

@customElement('apple-list-element')
export class ListElement extends LitElement {

	@property() spec: AppleReminderSpec;

	@property() refreshDisabled: boolean = false;

	@property() reminders: ReminderModel[] = [];
	@property() customReminders: ReminderModel[] = [];
	@property() listMeta: ListModel;

	@property() fileName: string | undefined;

	private readonly loadingBar = new LoadingBarComponent();

	get elements() {
		return this.reminders.concat(this.customReminders).map((rem) => {
			let el = new ReminderElement();
			el.model = rem;
			el.list_name = this.listMeta.name;
			return el;
		});
	}

	constructor(_spec: AppleReminderSpec) {
		super();
		this.spec = _spec;
	}

	static styles?: CSSResultGroup | undefined = css`
		.apple-list-reminders {
			margin: 0;
			padding: 0;
		}

		.apple-list-top-rule,
		.apple-list-bottom-rule {
			opacity: 0;
		}

		.compact-refresh-button {
			position: relative;
    	right: 0;
    	bottom: 32px;
    	float: right;
		}
	`;

	refresh() {
		this.refreshDisabled = true;

		RemindersDataService.fetchData(this.spec, this.fileName).then(
			([listData, reminders, customReminders]) => {
				this.reminders = reminders;
				this.listMeta = listData;
				this.customReminders = customReminders;
				this.refreshDisabled = false;
			}
		)
	}

	render() {
		return html`
			<div class="apple-list-container">
				${!this.spec?.compactView ? html`
				<hr class="apple-list-top-rule" />
				<h2>
					<span
						style="color: ${this.listMeta?.color}">${(!this.listMeta?.name) ? this.spec?.list : this.listMeta.name}</span>
				</h2>
				` : ""}

				${(this.listMeta) ? html`
					<span class="apple-list-reminders">
						${(this.elements.length > 0) ? this.elements : html`<small style="padding-bottom: 1rem;">No reminders found</small>`}
					</span>

				`
				: this.loadingBar
				}
				${!this.spec?.compactView ? html`
				<br />
				<button @click="${this.refresh}" ?disabled="${this.refreshDisabled}">Refresh</button>
				<hr class="apple-list-bottom-rule" />
				` : html`
				<button class="compact-refresh-button" @click="${this.refresh}" ?disabled="${this.refreshDisabled}">↻</button>
				`}
			</div>
		`;
	}
}
