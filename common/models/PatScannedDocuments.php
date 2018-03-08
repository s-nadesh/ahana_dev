<?php

namespace common\models;

use common\models\query\PatScannedDocumentsQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_scanned_documents".
 *
 * @property integer $scanned_doc_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property integer $encounter_id
 * @property string $scanned_doc_name
 * @property string $scanned_doc_creation_date
 * @property string $file_org_name
 * @property string $file_name
 * @property string $file_type
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatScannedDocuments extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_scanned_documents';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['file_org_name', 'file_name', 'file_type', 'scanned_doc_name', 'scanned_doc_creation_date'], 'required'],
            [['tenant_id', 'patient_id', 'encounter_id', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['file_org_name', 'file_name'], 'string', 'max' => 100],
            [['file_type'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'scanned_doc_id' => 'Scanned Doc ID',
            'tenant_id' => 'Tenant ID',
            'patient_id' => 'Patient ID',
            'encounter_id' => 'Encounter ID',
            'file_name' => 'File Name',
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
    public function getEncounter() {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PatScannedDocumentsQuery(get_called_class());
    }
    
    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Scanned Document Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Scanned Document Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatScannedDocuments::tableName(), $this->scanned_doc_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
