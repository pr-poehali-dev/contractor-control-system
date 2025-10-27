export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiline' | 'image';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'inspection_act' | 'defect_elimination_act' | 'work_acceptance_act' | 'custom';
  isSystem: boolean;
  userId: string;
  content: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  templateId: string;
  templateName: string;
  name: string;
  projectId?: string;
  workId?: string;
  inspectionId?: string;
  content: string;
  fieldValues: Record<string, any>;
  status: 'draft' | 'pending_signature' | 'signed';
  signatureType?: 'eds' | 'sms';
  signedAt?: string;
  signedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_TEMPLATES: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Акт проверки (об обнаружении замечаний)',
    description: 'Системный шаблон для фиксации замечаний по результатам проверки работ',
    type: 'inspection_act',
    isSystem: true,
    content: `<h1>АКТ ПРОВЕРКИ</h1>
<p>{{date}}</p>
<p>Объект: {{objectName}}</p>
<p>Работа: {{workName}}</p>

<p>Настоящий акт составлен о том, что {{inspectorName}} провел проверку выполненных работ и обнаружил следующие замечания:</p>

{{#if hasDefects}}
<table>
  <tr>
    <th>№</th>
    <th>Описание замечания</th>
    <th>Фото</th>
  </tr>
  {{#each defects}}
  <tr>
    <td>{{index}}</td>
    <td>{{description}}</td>
    <td>{{#if photo}}<img src="{{photo}}" />{{/if}}</td>
  </tr>
  {{/each}}
</table>
{{/if}}

<p>Замечания должны быть устранены до: {{deadlineDate}}</p>

<div class="signatures">
  <p>Заказчик: _________________ {{customerName}}</p>
  <p>Подрядчик: _________________ {{contractorName}}</p>
</div>`,
    fields: [
      { id: 'objectName', name: 'objectName', label: 'Название объекта', type: 'text', required: true },
      { id: 'workName', name: 'workName', label: 'Название работы', type: 'text', required: true },
      { id: 'inspectorName', name: 'inspectorName', label: 'ФИО проверяющего', type: 'text', required: true },
      { id: 'customerName', name: 'customerName', label: 'ФИО заказчика', type: 'text', required: true },
      { id: 'contractorName', name: 'contractorName', label: 'ФИО подрядчика', type: 'text', required: true },
      { id: 'deadlineDate', name: 'deadlineDate', label: 'Срок устранения', type: 'date', required: true },
    ]
  },
  {
    name: 'Акт об устранении дефектов',
    description: 'Системный шаблон для подтверждения устранения замечаний',
    type: 'defect_elimination_act',
    isSystem: true,
    content: `<h1>АКТ ОБ УСТРАНЕНИИ ДЕФЕКТОВ</h1>
<p>{{date}}</p>
<p>Объект: {{objectName}}</p>
<p>Работа: {{workName}}</p>

<p>Настоящий акт составлен о том, что подрядчик {{contractorName}} устранил следующие замечания, выявленные по акту проверки от {{inspectionDate}}:</p>

<table>
  <tr>
    <th>№</th>
    <th>Описание замечания</th>
    <th>Статус</th>
    <th>Фото после устранения</th>
  </tr>
  {{#each defects}}
  <tr>
    <td>{{index}}</td>
    <td>{{description}}</td>
    <td>Устранено</td>
    <td>{{#if photo}}<img src="{{photo}}" />{{/if}}</td>
  </tr>
  {{/each}}
</table>

<p>Все замечания устранены в полном объёме.</p>

<div class="signatures">
  <p>Подрядчик: _________________ {{contractorName}}</p>
  <p>Заказчик: _________________ {{customerName}}</p>
</div>`,
    fields: [
      { id: 'objectName', name: 'objectName', label: 'Название объекта', type: 'text', required: true },
      { id: 'workName', name: 'workName', label: 'Название работы', type: 'text', required: true },
      { id: 'contractorName', name: 'contractorName', label: 'ФИО подрядчика', type: 'text', required: true },
      { id: 'customerName', name: 'customerName', label: 'ФИО заказчика', type: 'text', required: true },
      { id: 'inspectionDate', name: 'inspectionDate', label: 'Дата акта проверки', type: 'date', required: true },
    ]
  },
  {
    name: 'Акт приёмки выполненных работ',
    description: 'Системный шаблон для приёмки завершённых работ',
    type: 'work_acceptance_act',
    isSystem: true,
    content: `<h1>АКТ ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ</h1>
<p>{{date}}</p>
<p>Объект: {{objectName}}</p>
<p>Работа: {{workName}}</p>

<p>Заказчик {{customerName}} и подрядчик {{contractorName}} составили настоящий акт о том, что работы выполнены в полном объёме и соответствуют установленным требованиям.</p>

<h3>Выполненные работы:</h3>
<p>{{workDescription}}</p>

<h3>Объём работ:</h3>
<p>{{workVolume}}</p>

<h3>Стоимость работ:</h3>
<p>{{workCost}} руб.</p>

<p>Претензий к качеству выполненных работ не имеется.</p>

<div class="signatures">
  <p>Заказчик: _________________ {{customerName}}</p>
  <p>Подрядчик: _________________ {{contractorName}}</p>
</div>`,
    fields: [
      { id: 'objectName', name: 'objectName', label: 'Название объекта', type: 'text', required: true },
      { id: 'workName', name: 'workName', label: 'Название работы', type: 'text', required: true },
      { id: 'customerName', name: 'customerName', label: 'ФИО заказчика', type: 'text', required: true },
      { id: 'contractorName', name: 'contractorName', label: 'ФИО подрядчика', type: 'text', required: true },
      { id: 'workDescription', name: 'workDescription', label: 'Описание работ', type: 'multiline', required: true },
      { id: 'workVolume', name: 'workVolume', label: 'Объём работ', type: 'text', required: true },
      { id: 'workCost', name: 'workCost', label: 'Стоимость работ', type: 'number', required: true },
    ]
  }
];
