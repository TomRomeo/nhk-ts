import {
	isNullish,
	JsonSerializer,
	JsonObject,
	JsonProperty,
} from 'typescript-json-serializer';

import 'reflect-metadata';
import fetch from 'node-fetch';

@JsonObject()
export class News {
	@JsonProperty({
		name: ['news_priority_number', 'top_priority_number'],
		beforeDeserialize: (value) =>
			Object.values(value)[0] || Object.values(value)[1],
	})
	priorityNumber = '0';

	@JsonProperty({ name: 'news_prearranged_time' })
	prearrangedTime = '';

	@JsonProperty({ name: 'news_id' })
	id = '';

	@JsonProperty()
	title = '';

	@JsonProperty({ name: 'title_with_ruby' })
	titleWRuby = '';

	// only works for top_news
	@JsonProperty({ name: 'outline_with_ruby' })
	outlineWRuby = '';

	@JsonProperty({ name: 'news_file_ver' })
	fileVer = false;

	@JsonProperty({ name: 'news_creation_time' })
	creationTime = '';

	@JsonProperty({ name: 'news_preview_time' })
	previewTime = '';

	@JsonProperty({ name: 'news_publication_time' })
	publicationTime = '';

	@JsonProperty({ name: 'news_publication_status' })
	publicationStatus = true;

	@JsonProperty({ name: 'has_news_web_image' })
	hasWebImage = false;

	@JsonProperty({ name: 'has_news_web_movie' })
	hasWebMovie = false;

	@JsonProperty({ name: 'has_news_easy_image' })
	hasEasyImage = false;

	@JsonProperty({ name: 'has_news_easy_movie' })
	hasEasyMovie = false;

	@JsonProperty({ name: 'has_news_easy_voice' })
	hasEasyVoice = false;

	@JsonProperty({ name: 'news_web_image_uri' })
	webImageUri = '';

	@JsonProperty({ name: 'news_web_movie_uri' })
	webMovieUri = '';

	@JsonProperty({ name: 'news_easy_image_uri' })
	easyImageUri = '';

	@JsonProperty({ name: 'news_easy_movie_uri' })
	easyMovieUri = '';

	@JsonProperty({ name: 'news_easy_voice_uri' })
	easyVoiceUri = '';

	@JsonProperty({
		name: ['news_display_flag', 'top_display_flag'],
		beforeDeserialize: (value) =>
			Object.values(value)[0] || Object.values(value)[1],
	})
	displayFlag = false;

	@JsonProperty({ name: 'news_web_url' })
	webUrl = '';
}

export class Nhk {
	#newsBasePath = 'https://www3.nhk.or.jp/news/easy/';
	#easyNewsEndpoint: string = this.#newsBasePath + 'news-list.json';
	#topNewsEndpoint: string = this.#newsBasePath + 'top-list.json';

	#jsonSerializer = new JsonSerializer();

	async getEasyNews() {
		const news: News[] = [];

		const res = await fetch(this.#easyNewsEndpoint);
		if (!res.ok) {
			throw new Error('Could not fetch news:' + res.body);
		}
		const json = await res.json();
		if (!Array.isArray(json) || json === null) {
			return news;
		}

		Object.values(json[0]).forEach((day) => {
			if (Array.isArray(day)) {
				const serialized = this.#jsonSerializer.deserializeObjectArray(
					day,
					News
				);
				if (isNewsArray(serialized)) {
					news.push(...serialized);
				}
			}
		});
		return news;
	}

	async getTopNews() {
		let news: News[] = [];

		const res = await fetch(this.#topNewsEndpoint);
		if (!res.ok) {
			throw new Error('Could not fetch news:' + res.body);
		}
		const json = await res.json();

		if (!Array.isArray(json) || json === null) {
			return news;
		}

		const serialized = this.#jsonSerializer.deserializeObjectArray(
			json,
			News
		);
		if (isNewsArray(serialized)) {
			news = serialized;
		}
		return news;
	}
}

const isNewsArray = (
	arr: null | undefined | (News | null | undefined)[]
): arr is News[] => {
	return !isNullish(arr) && arr.every((item) => item instanceof News);
};
