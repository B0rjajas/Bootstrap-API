
document.addEventListener('DOMContentLoaded', iniciarApp);

//DOnde se imprime 


const selectCategorias = document.querySelector('#categorias');


const resultado = document.querySelector('#resultado');
const modal = new bootstrap.Modal('#modal', {});


function iniciarApp(){

        obtenerCategorias();

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then( respuesta =>  respuesta.json())
            .then (resultado => mostrarCategorias(resultado.categories))

        };

        function mostrarCategorias(arraycategorias = []){
            arraycategorias.forEach(idcategoria => {

                const { strCategory} = idcategoria;

                const option = document.createElement('OPTION');
                option.value = strCategory;// propiedad del objeto idcategoria.
                option.textContent = idcategoria.strCategory;
                selectCategorias.appendChild(option);//Aqui donde va HTML OPTION
                //console.log(option);
                //console.log(idcategoria);
                


            })
        };

        if(selectCategorias){
            selectCategorias.addEventListener('change', eleccionCategoria);
        
        
        }

        //Pagina Favoritos.HTML
        const favoritoDIV = document.querySelector('.favoritos');
        if(favoritoDIV){
            obtenerFavoritos();
        }
        

        function eleccionCategoria(e) {
            const categoria = e.target.value
            const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

            fetch(url)
                .then( datos => datos.json())
                .then( respuesta => mostrarRecetas(respuesta.meals))
                .catch(error => console.error("Error al obtener las recetas:", error));

        };


        function mostrarRecetas(arrayrecetas = []){
            //console.log(arrayrecetas);
            
            limipiarHTML(resultado);//Limpiar los resultados;

            const heading = document.createElement('DIV');
            heading.classList.add('text-center', 'text-black', 'my-5');
            heading.textContent = (arrayrecetas.lenght) ?  'NO Hay Resultados' : 'Resultados';
            resultado.appendChild(heading);

            arrayrecetas.forEach(idRecetas => {

                //Desconstruir objetoArray siempre dentro del bucle
                const {idMeal, strMeal, strMealThumb} = idRecetas;
            
//Scripting

                //Altura y anchura CONTENEDOR
                //Al usar boostrap primerp CREAR EL DIV Y LUEGO LA COLUMNAS
                const recetaContenedor = document.createElement('DIV');
                recetaContenedor.classList.add('col-md-4');

                //Estilo al CONTENERDOR
                const recetaCard = document.createElement('DIV');
                recetaCard.classList.add('card', 'mb-4');


                //IMAGEN
                const recetaImagen = document.createElement('IMG');
                recetaImagen.classList.add('card-img-top')
                recetaImagen.alt = `Imagen de la receta ${strMeal ?? idRecetas.titulo}`;
                recetaImagen.src = strMealThumb ?? idRecetas.img;

                const recetaCardBody = document.createElement('DIV');
                recetaCardBody.classList.add('card-body');
                //console.log(recetaCard)

                //Heading CARD
                const recetaHeading = document.createElement('H3');
                recetaHeading.classList.add('card-title', 'mb-3');
                recetaHeading.textContent = strMeal ?? idRecetas.titulo;


                const recetaButton = document.createElement('BUTTON');
                recetaButton.classList.add('btn', 'btn-danger', 'w-100');
                recetaButton.textContent = 'ver Receta';

                recetaButton.dataset.bsTarget = '#modal';
                recetaButton.dataset.bstoogle = 'modal';


                recetaButton.onclick = function(){
                    seleccionarRceta(idMeal ?? idRecetas.id);
                }

                //INYECTAR AL HTML #resultado
                recetaCardBody.appendChild(recetaHeading);
                recetaCardBody.appendChild(recetaButton);

                recetaCard.appendChild(recetaImagen);
                recetaCard.appendChild(recetaCardBody);

                recetaContenedor.appendChild(recetaCard);

                resultado.appendChild(recetaContenedor);


            })

        }


        function seleccionarRceta(id){
            const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        
            fetch(url)
                .then(data => data.json())
                .then(respuesta => mostrarRecetaModal(respuesta.meals[0])) // Corrección aquí
        }


        function mostrarRecetaModal(detalleReceta){
            const { idMeal, strInstructions, strMeal, strMealThumb,} = detalleReceta;
                console.log(detalleReceta);
            const modalTitle = document.querySelector('#modal .modal-title');
            const modalBody = document.querySelector('#modal .modal-body');


            modalTitle.textContent = strMeal;
            modalBody.innerHTML = `
                <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
                <h3 class="my-3">Instrucciones</h3>
                <p>${strInstructions}</p>

                <h3 class="my-3">Ingredinetes y Cantidades</h3>
            `;

            const ListGropu = document.createElement('UL');
            ListGropu.classList.add('list-group');

            //Iterar Cantidades e ingredinetes

            for(let i = 1;  i <= 20; i++){
                if(detalleReceta[`strIngredient${i}`]){
                    const ingredientes = detalleReceta[`strIngredient${i}`]
                    const cantidad = detalleReceta[`strMeasure${i}`];

                    const ingredientesLi  = document.createElement('LI');
                    ingredientesLi.classList.add('list-group-item');
                    ingredientesLi.textContent = `${ingredientes} - ${cantidad}`
                    console.log(`${ingredientes} - ${cantidad}`);
                    ListGropu.appendChild(ingredientesLi);
                
                } 
            }
                // Agregar la lista al cuerpo del modal
                modalBody.appendChild(ListGropu);


                //Introduce los botones
                const modalFotter = document.querySelector('.modal-footer');
                //Limpiar los botones para evitar duplicados
                limipiarHTML(modalFotter);
                //Botones de cerrar y Favoritos
                const btnFavoritos = document.createElement('BUTTON');
                btnFavoritos.classList.add('btn', 'btn-danger', 'col');
                btnFavoritos.textContent = existeStorage(idMeal) ? 'Eliminar favorito':'Guardar Favorito';

                //LOcalStorage
                //Funcion favorito
                btnFavoritos.onclick = function(){
                    //console.log(existeStorage(idMeal));
                    
                    if(existeStorage(idMeal)){
                        eliminarFavorito(idMeal)
                        btnFavoritos.textContent = 'Guardar Favorito';
                        mostrarToast('Eliminado Correctamente'); 
                        return
                    }
                    
                    
                    
                    agregarFavorito({
                        id: idMeal,
                        titulo: strMeal, 
                        img: strMealThumb,
                    });

                    btnFavoritos.textContent = 'Eliminar Favorito';
                    mostrarToast('Agregado Correctamente'); 

                };

                const btnCerrarModal = document.createElement('BUTTON');
                btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
                btnCerrarModal.textContent = 'Cerrar';
                btnCerrarModal.onclick = function() {
                    modal.hide();
                }

                modalFotter.appendChild(btnFavoritos);
                modalFotter.appendChild(btnCerrarModal);


                //Muestra el modal;
                modal.show();
        }


        function agregarFavorito(receta) {
            //console.log(receta);
            const guardarFavoritos = JSON.parse(localStorage.getItem('guardarFavoritos')) ?? [];
            localStorage.setItem('guardarFavoritos', JSON.stringify([...guardarFavoritos,receta]));
        }

        //Eliminar Favorito
        function eliminarFavorito(id){
            const guardarFavoritos = JSON.parse(localStorage.getItem('guardarFavoritos')) ?? [];
            const nuevoFavorito = guardarFavoritos.filter(favorito => favorito.id !== id);
            localStorage.setItem('guardarFavoritos', JSON.stringify(nuevoFavorito));
        }


        //Buscar si existe favorito
        function existeStorage(id){
            const guardarFavoritos = JSON.parse(localStorage.getItem('guardarFavoritos')) ?? [];
            return guardarFavoritos.some(guardarFavoritos => guardarFavoritos.id === id );
        }


        function mostrarToast(mensaje){
            const toastDIV = document.querySelector('#toast');
            const toastBODY = document.querySelector('.toast-body')
            const toast = new bootstrap.Toast(toastDIV);
            toastBODY.textContent = mensaje;
            toast.show();
        }

        function obtenerFavoritos(){
            const guardarFavoritos = JSON.parse(localStorage.getItem('guardarFavoritos')) ?? [];
            //console.log(guardarFavoritos)
            if(guardarFavoritos.length){
                mostrarRecetas(guardarFavoritos)
                return
            }

            const noFavoritos = document.createElement('P');
            noFavoritos.textContent = 'No hay favoritos';
            noFavoritos.classList.add('fs-4', 'text-bold', 'text-center');
            resultado.appendChild(noFavoritos);
            
        }


        function limipiarHTML(selector){
            while(selector.firstChild){
                selector.removeChild(selector.firstChild);
            }
        }


        
};


