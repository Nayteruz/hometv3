class OnlineTV{

    apiKey = '404dc583-7efc-4c93-8f21-a782f977b9e7';
    pageMaxNum = 1;
    pageCurrent = 1;
    genres = [];
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
        await this.setGenres();
        let list = await this.apiRequest(this.listUrl.topFilms, {type: 'TOP_100_POPULAR_FILMS', page:1});
        this.pageMaxNum = list?.pagesCount || 1;
        let filmsList = list?.films || list?.items;

        $(document).find('.genres-wrap').append(this.setGenresHtml(this.genres));
        $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));

        $(document).find('.list-films-wrap').before(this.setPagination(this.pageMaxNum));
        $(document).find('.show-more').after(this.setPagination(this.pageMaxNum));
        this.selectPage();
        this.showMore();
        this.clickShowFilm();
        this.searchByName();
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
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json',
            }
        })
        $('.list-films-wrap').removeClass('load');
        return request.json();
    }

    setListFilm(list = []){
        if(!list.length) return ;
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
        let html = `<ul class="pagination">`;
        for (let p = 1; p<=max; p++){
            html += `<li class="item"><span class="${p === this.pageCurrent ? 'active' : ''}" data-page="${p}">${p}</span></li>`;
        }
        html += `</ul>`;
        return html;
    }

     selectPage(){
        $(document).on('click', '.pagination [data-page]', async e=>{
            let pi = e.target.dataset.page;
            this.pageCurrent = pi;
            $('.list-films-wrap').addClass('load');
            let list = await this.apiRequest(this.listUrl.lastUrlItem, {...this.listUrl.lastUrlItemParams, page:pi});
            this.pageMaxNum = list?.pagesCount || 1;
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));
            $('.pagination [data-page]').removeClass('active');
            $(e.target).addClass('active');

        })
    }

    async showMore(){
        $(document).on('click', '.show-more span', async e=>{
            let pi = $(document).find('.active[data-page]').data('page');
            let nextPage =  pi < this.pageMaxNum ? pi+1 : pi;
            if(nextPage === pi) return;
            $('.list-films-wrap').addClass('load');
            let list = await this.apiRequest(this.listUrl.lastUrlItem, {...this.listUrl.lastUrlItemParams, page:nextPage});
            this.pageMaxNum = list?.pagesCount || list?.totalPages || 1;
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').append(this.setListFilm(filmsList));
            $('.pagination [data-page]').removeClass('active');
            $(`.pagination [data-page="${nextPage}"]`).addClass('active');
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
            let genre = e.target.dataset.genre;
            $('.list-films-wrap').addClass('load');
            let list = await this.apiRequest(this.listUrl.films, {genres:genre, page:1});
            this.pageMaxNum = list?.pagesCount || list?.totalPages || 1;
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));

            $('.pagination').remove();
            this.pageCurrent = 1;
            if(this.pageMaxNum > 1) {
                $(document).find('.list-films-wrap').before(this.setPagination(this.pageMaxNum));
                $(document).find('.show-more').after(this.setPagination(this.pageMaxNum));
            }
            $('[data-genre]').removeClass('active');
            $(e.target).addClass('active');
        })
    }

    setYohoho(id){
        return `
            <div id="yohoho" data-resize="1" data-tv="1" data-autoplay="1" data-kinopoisk="${id}"></div>
            <script src="//yohoho.cc/yo.js"></script>
            `;
    }

    searchByName(){
        let $f = $('.search-by-name form');
        $f.on('submit', async e=>{
            let search_text = $('#sname').val().trim();
            let list = await this.apiRequest(this.listUrl.searchByWord, {keyword:search_text, page:1});
            this.pageMaxNum = list?.pagesCount || 1;
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));

            $('.pagination').remove();
            if(this.pageMaxNum > 1){
                $(document).find('.list-films-wrap').before(this.setPagination(this.pageMaxNum));
                $(document).find('.show-more').after(this.setPagination(this.pageMaxNum));
            }

            e.preventDefault();
        })
    }

    async setGenres(){
        let filters = await this.apiRequest(this.listUrl.filters, {});
        if(filters?.genres){
            this.genres = filters.genres.filter(x=>{
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
        return false;
    }

    setGenresHtml(list){
        let html = `<ul class="genres">`;
        for (let g of list){
            html += `<li class="item"><span class="" data-genre="${g.id}">${g.genre}</span></li>`;
        }
        html += `</ul>`;
        return html;
    }
}
$(()=>{
    new OnlineTV();
})
