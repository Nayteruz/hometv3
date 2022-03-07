class OnlineTV{

    pageMaxNum = 1;
    pageNum = 1;
    params = {
        apiKey : '404dc583-7efc-4c93-8f21-a782f977b9e7',
        genres : [],
        searchParams : {}
    };
    listUrl = {
        main : 'https://kinopoiskapiunofficial.tech/',
        topFilms : 'api/v2.2/films/top',
        searchByWord : 'api/v2.1/films/search-by-keyword',
        similar : 'api/v2.2/films/301/similars',
        filters : 'api/v2.2/films/filters',
        films: 'api/v2.2/films',
        lastUrlItem: '',
        lastUrlItemParams : ''
    }

    async start(){
        this.pageNum = +this.getURLParams()?.page || 1;
        this.getURLParams();
        this.searchByName();
        await this.setGenres();
        $(document).find('.list-films-wrap').addClass('load');
        let list = await this.searchByUrlParams(this.getURLParams()?.page || 1);
        this.pageMaxNum = list?.pagesCount || list?.totalPages || 1;
        let filmsList = list?.films || list?.items;

        $(document).find('.genres-wrap').html(this.setGenresHtml(this.params.genres));
        $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));

        $(document).find('.list-films-wrap').before(this.setPagination(this.pageMaxNum));
        $(document).find('.show-more').after(this.setPagination(this.pageMaxNum));

        this.clickPage();
        this.clickMore();
        this.clickShowFilm();
        this.clickGenre();
    }

    constructor() {
        this.start();
    }

    async apiRequest(url, params = {}){
        this.listUrl.lastUrlItem = url;
        this.listUrl.lastUrlItemParams = params;
        let basicUrl = new URL(this.listUrl.main + this.listUrl.lastUrlItem);
        let p = new URLSearchParams();
        for (let pp of Object.entries(this.listUrl.lastUrlItemParams)){
            p.append(pp[0], pp[1]);
        }
        basicUrl.search = p.toString();
        let u = basicUrl.href;
        let request = await fetch(u, {
            method: 'GET',
            headers: {
                'X-API-KEY': this.params.apiKey,
                'Content-Type': 'application/json',
            }
        })
        $('.list-films-wrap').removeClass('load');
        return request.json();
    }

    setListFilm(list = []){
        if(!list.length) return `<li class="no-films">Ничего не найдено</li>`;
        let $listFilms = '';
        for (let f of list){
            let rating = f?.rating || f?.ratingKinopoisk || 'нет';
            let $li = `<li class="item-film" data-id="${f?.filmId || f?.kinopoiskId}">
                    <div class="image">
                        <img src="${f.posterUrlPreview}" alt="${f.nameRu}">
                    </div>
                    <span class="rating">${rating == 'null' ? 'нет' : rating}</span>
                    <div class="options-wrap">
                        <ul  class="options">
                            <li class="name">${f?.nameRu || f?.nameEn || f?.nameOriginal || 'Без названия'}</li>
                        </ul>
                    </div>
                </li>`;
            $listFilms += $li;
        }
        return $listFilms;
    }

    setPagination(max){
        let page = this.getURLParams().page || 1;
        let html = `<ul class="pagination">`;
        if(max > 1){
            for (let p = 1; p<=max; p++){
                html += `<li class="item"><span class="${+page === +p ? 'active' : ''}" data-page="${p}">${p}</span></li>`;
            }
        }
        html += `</ul>`;
        return html;
    }

     clickPage(){
        $(document).on('click', '.pagination [data-page]', async e=>{
            let page = e.target.dataset.page;
            document.location.href = this.setURLParams({page});
        })
    }

    async clickMore(){
        $(document).on('click', '.show-more span', async e=>{
            if(this.pageNum >= this.pageMaxNum) return;
            this.pageNum += 1;
            $(document).find('.list-films-wrap').addClass('load');
            let list = await this.searchByUrlParams(this.pageNum);
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').append(this.setListFilm(filmsList));
            $('.pagination [data-page]').removeClass('active');
            $(`.pagination [data-page="${this.pageNum}"]`).addClass('active');
        })
    }

    clickShowFilm(){
        let cls = this;
        $(document).on('click', '.item-film', function (){
            let fid = $(this).data('id');
            $('.popup').show();
            $('.popup-stable-text').html(cls.setYohoho(fid));
        })
        $(document).find('.close-b').unbind();
        $(document).on('click', '.close-b', ()=>{
            $('.popup').hide();
            $('.popup-stable-text').html('');
        })
    }

    clickGenre(){
        $(document).on('click', '[data-genre]', async e=>{
            let genres = e.target.dataset.genre;
            document.location.href = this.setURLParams({genres, page:1});
        })
    }

    async searchByUrlParams(page_num = 1){
        if(this.getURLParams()?.keyword || this.getURLParams()?.genres){
            return await this.apiRequest(this.listUrl.films, {...this.params.searchParams, page:page_num});
        } else {
            return await this.apiRequest(this.listUrl.topFilms, {type: 'TOP_100_POPULAR_FILMS', page:page_num})
        }
    }

    setYohoho(id){
        return `
            <div id="yohoho" data-resize="1" data-tv="1" data-autoplay="1" data-kinopoisk="${id}"></div>
            <script src="//yohoho.cc/yo.js"></script>
            `;
    }

    searchByName(){
        let $f = $('.search-by-name form');
        if(this.params.searchParams.keyword){
            $f.find('[name="keyword"]').val(this.params.searchParams.keyword);
        }
        $f.on('submit', async e=>{
            document.location.href = this.setURLParams({keyword : $('#sname').val(), page:1});
            e.preventDefault();
        })
    }

    getURLParams(){
        let urlParams = new URLSearchParams(document.location.search);
        let params = {};
        for (let p of urlParams.entries()){
            params[p[0]] = p[1];
        }
        this.params.searchParams = params;
        return this.params.searchParams;
    }
    setURLParams(params = {}){
        let mainUrl = new URL(document.location.origin + document.location.pathname);
        let urlParams = new URLSearchParams(document.location.search);
        for (let p of Object.entries(params)){
            urlParams.set(p[0], p[1]);
        }
        mainUrl.search = urlParams.toString();
        return mainUrl.href;
    }

    async setGenres(){
        if(localStorage.getItem('genres')){
            this.params.genres = JSON.parse(localStorage.getItem('genres'));
            return this.params.genres;
        }
        let filters = await this.apiRequest(this.listUrl.filters, {});
        if(filters?.genres){
            this.params.genres = filters.genres.filter(x=>{
                if (
                    x.genre !== ''
                    && x.genre !== 'для взрослых'
                    && x.genre !== 'мюзикл'
                    && x.genre !== 'спорт'
                    && x.genre !== 'церемония'
                    && x.genre !== 'фильм-нуар'
                    && x.genre !== 'биография'
                    && x.genre !== 'вестерн'
                    && x.genre !== 'короткометражка'
                    && x.genre !== 'документальный'
                    && x.genre !== 'реальное ТВ'
                    && x.genre !== 'ток-шоу'
                    && x.genre !== 'концерт'
                    && x.genre !== 'игра'
                ){
                    return x;
                }
            });
        }
        localStorage.setItem('genres', JSON.stringify(this.params.genres));
        return this.params.genres;
    }

    setGenresHtml(list){
        let genre_id = this.getURLParams().genres || 0;
        let html = `<ul class="genres">`;
        for (let g of list){
            html += `<li class="item"><span class="${+g.id === +genre_id ? 'active' : ''}" data-genre="${g.id}">${g.genre}</span></li>`;
        }
        html += `</ul>`;
        return html;
    }
}
$(()=>{
    new OnlineTV();
})
