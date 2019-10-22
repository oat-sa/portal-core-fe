<div id="{{id}}" class="alert alert-{{level}} border-{{level}}" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Fermer">
        <span aria-hidden="true">&times;</span>
    </button>
    <svg class="icon">
        <use xlink:href="/images/icons.svg#icon-{{level}}"></use>
    </svg>
    <div>
        {{#if title}}<strong>{{title}}</strong><br>{{/if}}
        {{{msg}}}
    </div>
</div>
