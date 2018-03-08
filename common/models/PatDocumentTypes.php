<?php

namespace common\models;

use common\models\query\PatDocumentTypesQuery;
use yii\db\ActiveQuery;
use yii\helpers\Url;

/**
 * This is the model class for table "pat_document_types".
 *
 * @property integer $doc_type_id
 * @property integer $tenant_id
 * @property string $doc_type
 * @property string $doc_type_name
 * @property string $document_xml
 * @property string $document_xslt
 * @property string $document_out_xslt
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class PatDocumentTypes extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_document_types';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['doc_type_name', 'document_xml', 'document_xslt', 'document_out_xslt'], 'required'],
            [['tenant_id', 'created_by', 'modified_by'], 'integer'],
            [['document_xml', 'document_xslt', 'document_out_xslt', 'document_out_print_xslt', 'status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at', 'doc_type', 'doc_type_name'], 'safe'],
            [['doc_type'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'doc_type_id' => 'Doc Type ID',
            'tenant_id' => 'Tenant ID',
            'doc_type' => 'Doc Type',
            'document_xml' => 'Document Xml',
            'document_xslt' => 'Document Xslt',
            'document_out_xslt' => 'Document Output Xslt',
            'document_out_print_xslt' => 'Document Out Print Xslt',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PatDocumentTypesQuery(get_called_class());
    }

    public static function getDocumentType($type) {
        return self::find()->tenant()->andWhere(['doc_type' => $type])->one();
    }

    public static function getTenantDocumentTypes() {
        return array(
            'CH' => [
                'doc_type_name' => 'Case History',
                'document_xml' => file_get_contents(Url::base(true) . '/case_history.xml'),
                'document_xslt' => file_get_contents(Url::base(true) . '/case_history.xslt'),
                'document_out_xslt' => file_get_contents(Url::base(true) . '/case_history_out.xslt'),
                'document_out_print_xslt' => file_get_contents(Url::base(true) . '/case_history_out_print.xslt'),
            ]
        );
    }
    
    public static function getTenantmedicalDocumentTypes() {
        return array(
            'MCH' => [
                'doc_type_name' => 'Medical Case History',
                'document_xml' => file_get_contents(Url::base(true) . '/medical_case_history.xml'),
                'document_xslt' => file_get_contents(Url::base(true) . '/medical_case_history.xslt'),
                'document_out_xslt' => file_get_contents(Url::base(true) . '/medical_case_history_out.xslt'),
                'document_out_print_xslt' => file_get_contents(Url::base(true) . '/medical_casehistory_out_print.xslt'),
            ]
        );
    }

}
