<?php

namespace common\models;

use common\models\query\PatPastMedicalQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_past_medical".
 *
 * @property integer $pat_past_medical_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $past_medical
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PatPastMedical extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_past_medical';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['encounter_id', 'patient_id', 'past_medical'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
                [['past_medical', 'status'], 'string'],
                [['doc_id', 'created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['encounter_id'], 'exist', 'skipOnError' => true, 'targetClass' => PatEncounter::className(), 'targetAttribute' => ['encounter_id' => 'encounter_id']],
                [['patient_id'], 'exist', 'skipOnError' => true, 'targetClass' => PatPatient::className(), 'targetAttribute' => ['patient_id' => 'patient_id']],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'pat_past_medical_id' => 'Pat Past Medical ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'doc_id' => 'Doc ID',
            'past_medical' => 'Past Medical',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public static function find() {
        return new PatPastMedicalQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'created_by' => function ($model) {
                return $model->createdUser->name;
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

}
