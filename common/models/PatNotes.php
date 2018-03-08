<?php

namespace common\models;

use common\models\query\PatNotesQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_notes".
 *
 * @property integer $pat_note_id
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
 *
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatNotes extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_notes';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['notes'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
                [['notes', 'status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'pat_note_id' => 'Pat Note ID',
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

    /**
     * @return ActiveQuery
     */
    public function getCreatedUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'created_by']);
    }

    /**
     * @return ActiveQuery
     */
    public function getNotesUsers() {
        return $this->hasMany(PatNotesUsers::className(), ['pat_note_id' => 'note_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getUsers() {
        return $this->hasMany(CoUser::className(), ['user_id' => 'user_id'])->via('notesUsers');
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
            'created_by_name' => function ($model) {
                return (isset($model->createdUser) ? $model->createdUser->name : '-');
            },
            'created_by_short_name' => function ($model) {
                if (isset($model->createdUser)) {
                    if (strlen($model->createdUser->name) > 12) {
                        $short_name = substr($model->createdUser->name, 0, 12) . '...';
                    } else {
                        $short_name = $model->createdUser->name;
                    }
                    return $short_name;
                } else {
                    return '-';
                }
            },
            'encounter_status' => function ($model) {
                return $model->encounter->isActiveEncounter();
            },
            'created_date' => function ($model) {
                return date('Y-m-d', strtotime($model->created_at));
            },
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function find() {
        return new PatNotesQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            $message = $this->notes;
            $activity = 'Patient Note Added Successfully (#' . $this->encounter_id . ' )';
        } else {
            $message = "Updated: {$this->notes}";
            $activity = 'Patient Note Updated Successfully (#' . $this->encounter_id . ' )';
        }
        PatTimeline::insertTimeLine($this->patient_id, $this->created_at, 'Notes', '', $message, 'NOTES', $this->encounter_id);
        CoAuditLog::insertAuditLog(PatNotes::tableName(), $this->pat_note_id, $activity);

        return parent::afterSave($insert, $changedAttributes);
    }

}
