'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">practica-watts-front documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AlmacenDetailComponent.html" data-type="entity-link" >AlmacenDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AlmacenFormComponent.html" data-type="entity-link" >AlmacenFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AlmacenListComponent.html" data-type="entity-link" >AlmacenListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/ColorFormComponent.html" data-type="entity-link" >ColorFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ColorListComponent.html" data-type="entity-link" >ColorListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MovimientoFormComponent.html" data-type="entity-link" >MovimientoFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MovimientoListComponent.html" data-type="entity-link" >MovimientoListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductoFormComponent.html" data-type="entity-link" >ProductoFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductoListComponent.html" data-type="entity-link" >ProductoListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProyectoDetailComponent.html" data-type="entity-link" >ProyectoDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProyectoDetailGridComponent.html" data-type="entity-link" >ProyectoDetailGridComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProyectoDetailListComponent.html" data-type="entity-link" >ProyectoDetailListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProyectoListComponent.html" data-type="entity-link" >ProyectoListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RolFormComponent.html" data-type="entity-link" >RolFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RolListComponent.html" data-type="entity-link" >RolListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatsWidgetComponent.html" data-type="entity-link" >StatsWidgetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TallaFormComponent.html" data-type="entity-link" >TallaFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TallaListComponent.html" data-type="entity-link" >TallaListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuarioFormComponent.html" data-type="entity-link" >UsuarioFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuarioListComponent.html" data-type="entity-link" >UsuarioListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VarianteFormComponent.html" data-type="entity-link" >VarianteFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VarianteListComponent.html" data-type="entity-link" >VarianteListComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AlmacenService.html" data-type="entity-link" >AlmacenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CatalogoService.html" data-type="entity-link" >CatalogoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileDownloadService.html" data-type="entity-link" >FileDownloadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InventarioService.html" data-type="entity-link" >InventarioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MovimientoService.html" data-type="entity-link" >MovimientoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermisoService.html" data-type="entity-link" >PermisoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductoService.html" data-type="entity-link" >ProductoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProyectoService.html" data-type="entity-link" >ProyectoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolService.html" data-type="entity-link" >RolService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsuarioService.html" data-type="entity-link" >UsuarioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VarianteService.html" data-type="entity-link" >VarianteService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Almacen.html" data-type="entity-link" >Almacen</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AlmacenRequest.html" data-type="entity-link" >AlmacenRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Archivo.html" data-type="entity-link" >Archivo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Color.html" data-type="entity-link" >Color</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomUploadEvent.html" data-type="entity-link" >CustomUploadEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventarioFilters.html" data-type="entity-link" >InventarioFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventarioStock.html" data-type="entity-link" >InventarioStock</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InvitarUsuarioRequest.html" data-type="entity-link" >InvitarUsuarioRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginRequest.html" data-type="entity-link" >LoginRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginResponse.html" data-type="entity-link" >LoginResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MovimientoFilters.html" data-type="entity-link" >MovimientoFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MovimientoRequest.html" data-type="entity-link" >MovimientoRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MovimientoResponse.html" data-type="entity-link" >MovimientoResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Page.html" data-type="entity-link" >Page</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Permiso.html" data-type="entity-link" >Permiso</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Producto.html" data-type="entity-link" >Producto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductoFilters.html" data-type="entity-link" >ProductoFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductoRequest.html" data-type="entity-link" >ProductoRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Proyecto.html" data-type="entity-link" >Proyecto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProyectoRequest.html" data-type="entity-link" >ProyectoRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Rol.html" data-type="entity-link" >Rol</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Talla.html" data-type="entity-link" >Talla</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Usuario.html" data-type="entity-link" >Usuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Variante.html" data-type="entity-link" >Variante</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VarianteFilters.html" data-type="entity-link" >VarianteFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VarianteProductoInfo.html" data-type="entity-link" >VarianteProductoInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VarianteRequest.html" data-type="entity-link" >VarianteRequest</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/CustomDatePipe.html" data-type="entity-link" >CustomDatePipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/FileTypePipe.html" data-type="entity-link" >FileTypePipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/SecureImagePipe.html" data-type="entity-link" >SecureImagePipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});