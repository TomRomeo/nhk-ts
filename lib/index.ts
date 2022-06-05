import {
	isNullish,
	JsonSerializer,
	JsonObject,
	JsonProperty,
} from 'typescript-json-serializer';

import 'reflect-metadata';

@JsonObject()
export class News {
	/**
	 * the priority number for the news article
	 */
	@JsonProperty({
		name: ['news_priority_number', 'top_priority_number'],
		beforeDeserialize: (value) =>
			Object.values(value)[0] || Object.values(value)[1],
	})
	priorityNumber = '0';

	/**
	 * the prearranged time for the publication of the article
	 */
	@JsonProperty({ name: 'news_prearranged_time' })
	prearrangedTime = '';

	/**
	 * the ID of the article
	 */
	@JsonProperty({ name: 'news_id' })
	id = '';

	/**
	 * the title of the article containing Kanji.
	 */
	@JsonProperty()
	title = '';

	/**
	 * the title of the article containing Kanji with rubies (furigana)
	 */
	@JsonProperty({ name: 'title_with_ruby' })
	titleWRuby = '';

	/**
	 * the outline for the article containing Kanji with rubies (furigana)
	 * this field is only populated by `getTopNews()`
	 */
	// only works for top_news
	@JsonProperty({ name: 'outline_with_ruby' })
	outlineWRuby = '';

	// TODO: documentation - no clue what this option is
	@JsonProperty({ name: 'news_file_ver' })
	fileVer = false;

	/**
	 * the creation time for the article
	 */
	@JsonProperty({ name: 'news_creation_time' })
	creationTime = '';

	/**
	 * the preview time for the article
	 */
	// TODO: ????
	@JsonProperty({ name: 'news_preview_time' })
	previewTime = '';

	/**
	 * the publicatoin time for the article
	 */
	@JsonProperty({ name: 'news_publication_time' })
	publicationTime = '';

	/**
	 * the publicatoin status for the article
	 */
	@JsonProperty({ name: 'news_publication_status' })
	publicationStatus = true;

	/**
	 * whether the article contains a web image uri
	 */
	@JsonProperty({ name: 'has_news_web_image' })
	hasWebImage = false;

	/**
	 * whether the article contains a web movie uri
	 */
	@JsonProperty({ name: 'has_news_web_movie' })
	hasWebMovie = false;

	/**
	 * whether the article contains an easy image uri
	 */
	@JsonProperty({ name: 'has_news_easy_image' })
	hasEasyImage = false;

	/**
	 * whether the article contains an easy movie uri
	 */
	@JsonProperty({ name: 'has_news_easy_movie' })
	hasEasyMovie = false;

	/**
	 * whether the article contains a voiced version uri
	 */
	@JsonProperty({ name: 'has_news_easy_voice' })
	hasEasyVoice = false;

	/**
	 * The web image uri for the article.
	 * This might be '', check if an image uri is available
	 * with the `hasWebImage` property
	 */
	@JsonProperty({ name: 'news_web_image_uri' })
	webImageUri = '';

	/**
	 * The web movie uri for the article.
	 * This might be '', check if a movie uri is available
	 * with the `hasWebMovie` property
	 */
	@JsonProperty({ name: 'news_web_movie_uri' })
	webMovieUri = '';

	/**
	 * The easy image uri for the article.
	 * This might be '', check if an image uri is available
	 * with the `hasEasyImage` property
	 */
	@JsonProperty({ name: 'news_easy_image_uri' })
	easyImageUri = '';

	/**
	 * The easy movie uri for the article.
	 * This might be '', check if a movie uri is available
	 * with the `hasEasyMovie` property
	 */
	@JsonProperty({ name: 'news_easy_movie_uri' })
	easyMovieUri = '';

	/**
	 * The voice uri for the article.
	 * This might be '', check if a voice uri is available
	 * with the `hasEasyVoice` property
	 */
	@JsonProperty({ name: 'news_easy_voice_uri' })
	easyVoiceUri = '';

	// TODO: documentation
	@JsonProperty({
		name: ['news_display_flag', 'top_display_flag'],
		beforeDeserialize: (value) =>
			Object.values(value)[0] || Object.values(value)[1],
	})
	displayFlag = false;

	/**
	 * The full url to the complete article
	 */
	@JsonProperty({ name: 'news_web_url' })
	webUrl = '';
}

/**
 * Wrapper for Nhk news articles
 */
export class Nhk {
	#newsBasePath = 'https://www3.nhk.or.jp/news/easy/';
	#easyNewsEndpoint: string = this.#newsBasePath + 'news-list.json';
	#topNewsEndpoint: string = this.#newsBasePath + 'top-list.json';

	#jsonSerializer = new JsonSerializer();

	/**
	 * Returns a list of articles marked as 'easy' as News objects
	 * @returns {Promise<News[]>} a promise that resolves to the list of articles
	 */
	async getEasyNews() {
		const news: News[] = [];

		const res = await fetch(this.#easyNewsEndpoint);
		if (!res.ok) {
			throw new Error('Could not fetch news:' + res.body);
		}
		// remove weird zero width characters at the start and end of the file
        let text = await res.text();
        text = text.trim();
        const json = JSON.parse(text);

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

	/**
	 * Returns a list of recent 'top' articles as News objects
	 * @returns {Promise<News[]>} a promise that resolves to the list of articles
	 */
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

/**
 * A typescript type guard function to check an array for News objects
 * @param arr an array to be checked
 * @returns whether the array contains News elements
 */
const isNewsArray = (
	arr: null | undefined | (News | null | undefined)[]
): arr is News[] => {
	return !isNullish(arr) && arr.every((item) => item instanceof News);
};
