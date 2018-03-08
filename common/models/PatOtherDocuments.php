<?php

namespace common\models;

use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_other_documents".
 *
 * @property integer $other_doc_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property integer $encounter_id
 * @property string $other_doc_name
 * @property string $other_doc_content
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
class PatOtherDocuments extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_other_documents';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['other_doc_name', 'other_doc_content'], 'required'],
            [['tenant_id', 'patient_id', 'encounter_id', 'created_by', 'modified_by'], 'integer'],
            [['other_doc_content', 'status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at', 'doc_type'], 'safe'],
            [['other_doc_name'], 'string', 'max' => 100]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'other_doc_id' => 'Other Doc ID',
            'tenant_id' => 'Tenant ID',
            'patient_id' => 'Patient ID',
            'encounter_id' => 'Encounter ID',
            'doc_type' => 'Doc Type',
            'other_doc_name' => 'Document Name',
            'other_doc_content' => 'Description',
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
    
    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Other Document Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Other Document Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatOtherDocuments::tableName(), $this->other_doc_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
