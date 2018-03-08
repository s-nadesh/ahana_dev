<?php

namespace common\models;

use common\models\query\PatAllergiesQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_allergies".
 *
 * @property integer $pat_allergies_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $notes
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PatAllergies extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_allergies';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'encounter_id', 'patient_id', 'notes'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
                [['notes', 'status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
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
            'pat_allergies_id' => 'Pat Allergies ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'notes' => 'Notes',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public function fields() {
        $extend = [
            'short_notes' => function ($model) {
                if (isset($model->notes)) {
                    if (strlen($model->notes) > 40) {
                        $notes = substr($model->notes, 0, 40) . '...';
                    } else {
                        $notes = $model->notes;
                    }
                    return $notes;
                } else {
                    return '-';
                }
            },
            'full_notes' => function ($model) {
                return nl2br($model->notes);
            },
            'concatenate_notes' => function ($model) {
                if (isset($model->notes)) {
                    if (strlen($model->notes) > 40) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            'created_by' => function ($model) {
                return $model->createdUser->name;
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function find() {
        return new PatAllergiesQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            $activity = 'Allergies Added Successfully (#' . $this->encounter_id . ' )';
        } else {
            $activity = 'Allergies Updated Successfully (#' . $this->encounter_id . ' )';
        }
        CoAuditLog::insertAuditLog(PatAllergies::tableName(), $this->pat_allergies_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
