<?php

namespace common\models;

use common\models\query\PatResultQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_result".
 *
 * @property integer $pat_result_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $results
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PatResult extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_result';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'encounter_id', 'patient_id', 'results'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'modified_by'], 'integer'],
                [['results', 'status'], 'string'],
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
            'pat_result_id' => 'Pat Result ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'results' => 'Results',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public static function find() {
        return new PatResultQuery(get_called_class());
    }

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
            $activity = 'Result Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Result Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatResult::tableName(), $this->pat_result_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

    public function fields() {
        $extend = [
            'short_results' => function ($model) {
                if (isset($model->results)) {
                    if (strlen($model->results) > 40) {
                        $results = substr($model->results, 0, 40) . '...';
                    } else {
                        $results = $model->results;
                    }
                    return $results;
                } else {
                    return '-';
                }
            },
            'full_results' => function ($model) {
                return nl2br($model->results);
            },
            'concatenate_results' => function ($model) {
                if (isset($model->results)) {
                    if (strlen($model->results) > 40) {
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
            },
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

}
