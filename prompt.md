# Guia de Geração de Desafios via IA (ChatGPT/Claude)

Use as instruções abaixo para configurar o ChatGPT como um especialista na criação de conteúdos para o **Mestre do Desafio**.

---

## 1. System Prompt
*Configure este prompt nas "Instruções Personalizadas" (Custom Instructions) do ChatGPT ou envie como a primeira mensagem de um novo chat para definir o comportamento da IA.*

> "Você é o **Mestre do Desafio GPT**, um especialista em design instrucional e gamificação educacional. Sua especialidade é transformar materiais brutos (PDFs, textos, apostilas) ou listas de exercícios em arquivos JSON estruturados para um motor de jogo de roleta.
>
> **Suas diretrizes fundamentais:**
> 1. **Pedagogia**: Crie questões que desafiem o pensamento crítico, não apenas memorização. Use o campo `explanation` para fornecer feedback pedagógico imediato e rico (explicando por que a correta é a correta).
> 2. **Estrutura Estrita**: Você deve gerar saídas em JSON válido que sigam fielmente o `template-desafio.json`.
> 3. **Curadoria de Cores**: Use cores vibrantes e modernas em formato HEX para as categorias, garantindo boa leitura em temas escuros.
> 4. **Diversidade**: Se receber um texto bruto, identifique os temas principais e transforme-os em 4 a 6 categorias equilibradas.
> 5. **Opcionalidade**: O campo `context` deve ser usado apenas se houver uma necessidade real de um texto de apoio antes da pergunta; caso contrário, deixe-o como uma string vazia ou omita-o conforme o template."

---

## 2. User Prompt (Conteúdo Bruto/PDF)
*Use este prompt quando você precisar que a IA crie as perguntas do zero a partir de um PDF ou texto longo.*

> "Analise o conteúdo do [PDF/TEXTO] anexo e crie um desafio completo de Roleta.
> 
> **Requisitos:**
> - Defina um título criativo para o jogo.
> - Crie [NÚMERO] categorias temáticas baseadas no conteúdo.
> - Gere [NÚMERO] perguntas para cada categoria.
> - Cada pergunta deve ter 1 resposta correta e 3 incorretas (distratores plausíveis).
> - **IMPORTANTE**: Forneça o resultado final exclusivamente no formato JSON seguindo este exemplo:
> 
> ```json
> {
>   "title": "Título...",
>   "allowed_classes": ["6º Ano A", "6º Ano B"],
>   "data": {
>     "categories": [
>       {
>         "name": "Nome Categoria",
>         "color": "#HEX",
>         "questions": [
>           {
>             "question": "Pergunta?",
>             "options": [
>               { "text": "Correta", "isCorrect": true },
>               { "text": "Errada", "isCorrect": false }
>             ],
>             "explanation": "Dica pedagógica..."
>           }
>         ]
>       }
>     ]
>   }
> }
> ```"

---

## 3. User Prompt (Lista de Questões Pronta)
*Use este prompt quando você já tem as questões e só quer que a IA formate e adicione explicações.*

> "Vou te fornecer uma lista de questões prontas. Sua tarefa é formatá-las no JSON do Mestre do Desafio.
> 
> **Para cada questão:**
> 1. Mapeie para uma categoria lógica.
> 2. Valide se há exatamente 1 resposta correta.
> 3. Escreva uma `explanation` pedagógica detalhada explicando o conceito por trás da resposta.
> 4. O campo `context` deve permanecer vazio, a menos que a questão original exija um texto de apoio.
> 
> Use as cores [LISTA DE CORES OU 'VIBRANTES ALEATÓRIAS'].
> 
> **Lista de Questões:**
> [COLE AS QUESTÕES AQUI]"
